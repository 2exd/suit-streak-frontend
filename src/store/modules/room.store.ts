import {defineStore} from "pinia"
import {computed, ref} from "vue"
import {v4 as uuidv4} from "uuid"
import {useUserStore} from "@/store/modules/user.store.ts"

// 房间类型定义
interface Room {
    id: string; // 房间唯一ID
    name: string; // 房间名称（可选）
    status: "waiting" | "playing"; // 房间状态
    maxPlayers: 4; // 固定4人房
    currentPlayers: RoomPlayer[]; // 当前玩家列表
    hostId: string; // 房主ID（第一位玩家）
}

// 房间内玩家类型定义
interface RoomPlayer {
    id: string; // 玩家唯一标识（可基于username生成）
    username: string; // 玩家昵称
    readyStatus: "preparing" | "ready"; // 准备状态
}

// 当前房间状态（玩家视角）
interface CurrentRoomState {
    isInRoom: boolean; // 是否在房间内
    currentRoom: Room | null; // 当前所在房间
    myPlayerId: string; // 自己的玩家ID
}

export const useRoomStore = defineStore(
    "room",
    () => {
        const userStore = useUserStore()

        // 状态：全局房间列表（所有可加入的房间）
        const roomList = ref<Room[]>([])

        // 状态：当前房间信息（玩家所在房间）
        const currentRoomState = ref<CurrentRoomState>({
            isInRoom: false,
            currentRoom: null,
            myPlayerId: "",
        })

        // 计算属性：当前房间内的自己
        const myPlayerInfo = computed(() => {
            if (!currentRoomState.value.currentRoom) return null
            return currentRoomState.value.currentRoom.currentPlayers.find(
                player => player.id === currentRoomState.value.myPlayerId
            )
        })

        // 计算属性：当前房间是否所有玩家已准备
        const isAllReady = computed(() => {
            if (!currentRoomState.value.currentRoom) return false
            return currentRoomState.value.currentRoom.currentPlayers.every(
                player => player.readyStatus === "ready"
            )
        })

        // 计算属性：自己是否是房主
        const amIHost = computed(() => {
            if (!currentRoomState.value.currentRoom) return false
            return currentRoomState.value.currentRoom.hostId === currentRoomState.value.myPlayerId
        })

        // 行动：创建房间
        const createRoom = (roomName?: string): Room => {
            if (!userStore.isLoggedIn) {
                throw new Error("请先设置用户名")
            }

            // 生成玩家ID（基于username+时间戳简单生成）
            const myPlayerId = `${userStore.username}-${Date.now().toString().slice(-4)}`

            // 创建房间
            const newRoom: Room = {
                id: uuidv4().slice(0, 6), // 简化房间ID为6位
                name: roomName || `默认房间-${Date.now().toString().slice(-4)}`,
                status: "waiting",
                maxPlayers: 4,
                currentPlayers: [
                    {
                        id: myPlayerId,
                        username: userStore.username,
                        readyStatus: "preparing",
                    },
                ],
                hostId: myPlayerId, // 房主为创建者
            }

            // 更新状态
            roomList.value.push(newRoom)
            currentRoomState.value = {
                isInRoom: true,
                currentRoom: newRoom,
                myPlayerId: myPlayerId,
            }

            // 预留：后端创建房间接口
            // await api.createRoom(newRoom);

            return newRoom
        }

        // 行动：加入房间
        const joinRoom = (roomId: string) => {
            if (!userStore.isLoggedIn) {
                throw new Error("请先设置用户名")
            }

            const targetRoom = roomList.value.find(room => room.id === roomId)
            if (!targetRoom) {
                throw new Error("房间不存在或已关闭")
            }

            if (targetRoom.currentPlayers.length >= targetRoom.maxPlayers) {
                throw new Error("房间已满")
            }

            // 生成自己的玩家ID
            const myPlayerId = `${userStore.username}-${Date.now().toString().slice(-4)}`

            // 检查是否已在房间内
            const isAlreadyIn = targetRoom.currentPlayers.some(
                player => player.username === userStore.username
            )
            if (isAlreadyIn) {
                throw new Error("你已在该房间内")
            }

            // 添加玩家到房间
            targetRoom.currentPlayers.push({
                id: myPlayerId,
                username: userStore.username,
                readyStatus: "preparing",
            })

            // 更新当前房间状态
            currentRoomState.value = {
                isInRoom: true,
                currentRoom: targetRoom,
                myPlayerId: myPlayerId,
            }

            // 预留：后端加入房间接口
            // await api.joinRoom(roomId, { username: userStore.username });
        }

        // 行动：切换准备状态
        const toggleReadyStatus = () => {
            if (!currentRoomState.value.currentRoom || !myPlayerInfo.value) return

            // 切换自己的准备状态
            myPlayerInfo.value.readyStatus = myPlayerInfo.value.readyStatus === "ready"
                ? "preparing"
                : "ready"

            // 预留：同步到后端
            // await api.updateReadyStatus(
            //   currentRoomState.value.currentRoom.id,
            //   myPlayerInfo.value.readyStatus
            // );
        }

        // 行动：开始游戏（仅房主可调用）
        const startGame = () => {
            if (!amIHost.value || !isAllReady.value) return

            if (currentRoomState.value.currentRoom) {
                currentRoomState.value.currentRoom.status = "playing"
                // 预留：后端开始游戏接口
                // await api.startGame(currentRoomState.value.currentRoom.id);
            }
        }

        // 行动：离开房间
        const leaveRoom = () => {
            if (!currentRoomState.value.currentRoom) return

            const roomId = currentRoomState.value.currentRoom.id
            const myId = currentRoomState.value.myPlayerId

            // 更新房间列表（移除自己）
            const roomIndex = roomList.value.findIndex(room => room.id === roomId)
            if (roomIndex > -1) {
                const updatedPlayers = roomList.value[roomIndex].currentPlayers.filter(
                    player => player.id !== myId
                )

                // 如果房间为空则删除房间，否则更新玩家列表
                if (updatedPlayers.length === 0) {
                    roomList.value.splice(roomIndex, 1)
                } else {
                    roomList.value[roomIndex].currentPlayers = updatedPlayers
                    // 如果房主离开，重新指定房主为第一位玩家
                    if (roomList.value[roomIndex].hostId === myId) {
                        roomList.value[roomIndex].hostId = updatedPlayers[0].id
                    }
                }
            }

            // 重置当前房间状态
            currentRoomState.value = {
                isInRoom: false,
                currentRoom: null,
                myPlayerId: "",
            }

            // 预留：后端离开房间接口
            // await api.leaveRoom(roomId);
        }

        // 行动：刷新房间列表（模拟后端拉取）
        const refreshRoomList = () => {
            // 预留：从后端拉取最新房间列表
            // const freshList = await api.getRoomList();
            // roomList.value = freshList.filter(room => room.status === 'waiting');
        }

        // 初始化时刷新房间列表
        refreshRoomList()

        return {
            roomList,
            currentRoomState,
            myPlayerInfo,
            isAllReady,
            amIHost,
            createRoom,
            joinRoom,
            toggleReadyStatus,
            startGame,
            leaveRoom,
            refreshRoomList,
        }
    },
    {
        // 可选：持久化当前房间状态（断线重连用）
        persist: {
            key: "suit-streak-room",
            storage: localStorage,
        },
    }
)
