import { defineStore } from 'pinia'
import { useUserStore } from './user.store'
import { v4 as uuidv4 } from 'uuid'
import { ref,computed } from 'vue'

// 玩家类型定义
interface Player {
    id: string // 用户唯一标识
    name: string // 昵称
    isReady: boolean // 准备状态
}

// 房间类型定义
interface Room {
    id: string // 房间ID
    name: string // 房间名称（可选）
    host: string // 房主ID（第一个进入的玩家）
    players: Player[] // 房间内玩家
    maxPlayers: number // 最大玩家数（固定4人）
    status: 'waiting' | 'playing' // 房间状态
}

export const useRoomStore = defineStore('room', () => {
    const userStore = useUserStore()
    const rooms = ref<Room[]>([
        // 预设测试房间
        {
            id: 'RM001',
            name: '新手房',
            host: 'user1',
            players: [
                { id: 'user1', name: '玩家1', isReady: false },
                { id: 'user2', name: '玩家2', isReady: true },
            ],
            maxPlayers: 4,
            status: 'waiting'
        },
        {
            id: 'RM002',
            name: '高手挑战',
            host: 'user3',
            players: [
                { id: 'user3', name: '高手', isReady: true },
            ],
            maxPlayers: 4,
            status: 'waiting'
        }
    ])
    const currentRoom = ref<Room | null>(null) // 当前所在房间

    // 获取可加入的空闲房间
    const availableRooms = computed(() => {
        return rooms.value.filter(room =>
            room.status === 'waiting' && room.players.length < room.maxPlayers
        )
    })

    // 创建房间
    const createRoom = (roomName?: string) => {
        const userId = userStore.userId || uuidv4() // 假设userStore有userId
        const newRoom: Room = {
            id: `RM${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, // 简单生成房间ID
            name: roomName || `默认房间-${new Date().getSeconds()}`,
            host: userId,
            players: [{
                id: userId,
                name: userStore.username || `玩家${Math.floor(Math.random() * 100)}`,
                isReady: false
            }],
            maxPlayers: 4,
            status: 'waiting'
        }
        rooms.value.push(newRoom)
        currentRoom.value = newRoom
        return newRoom.id
    }

    // 加入房间
    const joinRoom = (roomId: string) => {
        const room = rooms.value.find(r => r.id === roomId)
        if (!room) return { success: false, message: '房间不存在' }
        if (room.players.length >= room.maxPlayers) return { success: false, message: '房间已满' }
        if (room.status !== 'waiting') return { success: false, message: '房间正在游戏中' }

        const userId = userStore.userId || uuidv4()
        // 防止重复加入
        if (room.players.some(p => p.id === userId)) {
            currentRoom.value = room
            return { success: true }
        }

        // 添加当前用户到房间
        room.players.push({
            id: userId,
            name: userStore.username || `玩家${Math.floor(Math.random() * 100)}`,
            isReady: false
        })
        currentRoom.value = room
        return { success: true }
    }

    // 退出房间
    const leaveRoom = () => {
        if (!currentRoom.value) return

        const userId = userStore.userId || ''
        // 移除当前用户
        currentRoom.value.players = currentRoom.value.players.filter(p => p.id !== userId)

        // 如果房主退出，重新指定房主（取剩余第一个玩家）
        if (currentRoom.value.host === userId) {
            if (currentRoom.value.players.length > 0) {
                currentRoom.value.host = currentRoom.value.players[0].id
            } else {
                // 房间空了，删除房间
                rooms.value = rooms.value.filter(r => r.id !== currentRoom.value!.id)
            }
        }

        currentRoom.value = null
    }

    // 更新准备状态
    const toggleReadyStatus = () => {
        if (!currentRoom.value) return
        const userId = userStore.userId || ''
        const player = currentRoom.value.players.find(p => p.id === userId)
        if (player) {
            player.isReady = !player.isReady
        }
    }

    // 检查是否所有玩家都已准备
    const isAllReady = computed(() => {
        return currentRoom.value
            ? currentRoom.value.players.length === currentRoom.value.maxPlayers
            && currentRoom.value.players.every(p => p.isReady)
            : false
    })

    // 开始游戏（仅房主可调用）
    const startGame = () => {
        if (!currentRoom.value) return false
        const userId = userStore.userId || ''
        if (currentRoom.value.host !== userId) return false // 非房主不可开始
        if (!isAllReady.value) return false // 未全部准备

        currentRoom.value.status = 'playing'
        // 这里可以添加跳转游戏页面的逻辑
        return true
    }

    return {
        rooms,
        currentRoom,
        availableRooms,
        createRoom,
        joinRoom,
        leaveRoom,
        toggleReadyStatus,
        isAllReady,
        startGame
    }
})
