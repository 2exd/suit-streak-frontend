<script
  lang="ts"
  setup
>
import {computed, onMounted} from "vue"
import {useRouter} from "vue-router"
import {useRoomStore} from "@/store/modules/room.store.ts"
import {useUserStore} from "@/store/modules/user.store.ts"
import {showConfirmDialog, showToast} from "vant"


const roomStore = useRoomStore()
const userStore = useUserStore()
const router = useRouter()

// 检查是否在房间内，不在则返回大厅
onMounted(() => {
  if (!roomStore.currentRoom) {
    router.push("/lobby")
    showToast("房间不存在或已关闭")
  }
})

// 当前用户是否是房主
const isHost = computed(() => {
  return roomStore.currentRoom?.host === userStore.userId
})

// 当前用户的准备状态
const userReadyStatus = computed(() => {
  const currentPlayer = roomStore.currentRoom?.players.find(
    p => p.id === userStore.userId
  )
  return currentPlayer?.isReady || false
})

// 处理准备状态切换
const handleToggleReady = () => {
  roomStore.toggleReadyStatus()
}

// 处理开始游戏
const handleStartGame = () => {
  const success = roomStore.startGame()
  if (success) {
    showToast("游戏开始！")
    // 这里可以添加跳转到游戏页面的逻辑
    // router.push('/game')
  } else if (!isHost.value) {
    showToast("只有房主可以开始游戏")
  } else {
    showToast("等待所有玩家准备...")
  }
}

// 处理退出房间
const handleLeaveRoom = () => {
  showConfirmDialog({
    title: "退出房间",
    message: "确定要退出当前房间吗？",
  }).then(() => {
    roomStore.leaveRoom()
    router.push("/lobby")
  })
}
</script>

<template>
  <div
    v-if="roomStore.currentRoom"
    class="room-page min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 flex flex-col"
  >
    <!-- 房间信息 -->
    <div class="bg-white rounded-xl shadow-md p-2 m-4">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold text-indigo-800">{{
              roomStore.currentRoom.name || `房间 ${roomStore.currentRoom.id}`
                                                        }}</h1>
          <p class="text-sm text-gray-500 mt-1">
            房间ID: {{
              roomStore.currentRoom.id
            }}
            <span
              v-if="isHost"
              class="ml-2 text-green-600"
            >房主</span>
          </p>
        </div>
        <van-button
          type="warning"
          @click="handleLeaveRoom"
        >
          退出房间
        </van-button>
      </div>
    </div>

    <!-- 玩家列表 -->
    <div class="p-4 mb-6">
      <div
        slot="title"
        class="text-lg font-semibold text-indigo-700"
      >
        玩家列表 ({{
          roomStore.currentRoom.players.length
        }}/{{
          roomStore.currentRoom.maxPlayers
        }})
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2">
        <div
          v-for="(player, index) in roomStore.currentRoom.players"
          :key="player.id"
          class="flex justify-between items-center p-3 bg-indigo-50 rounded-lg"
        >
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 mr-2">
              {{
                index + 1
              }}
            </div>
            <div>
              <div class="font-medium">{{
                  player.name
                                       }}
              </div>
              <div class="text-xs text-gray-500">
                {{
                  player.id === roomStore.currentRoom.host ? "房主" : "玩家"
                }}
              </div>
            </div>
          </div>
          <div
            :class="player.isReady ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
            class="px-3 py-1 rounded-full text-sm"
          >
            {{
              player.isReady ? "已准备" : "准备中"
            }}
          </div>
        </div>

        <!-- 空位显示 -->
        <div
          v-for="index in (roomStore.currentRoom.maxPlayers - roomStore.currentRoom.players.length)"
          :key="`empty-${index}`"
          class="flex justify-between items-center p-3 bg-gray-50 rounded-lg opacity-50"
        >
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-2">
              {{
                roomStore.currentRoom.players.length + index
              }}
            </div>
            <div class="text-gray-400">等待玩家加入...</div>
          </div>
          <div class="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-500">
            准备中
          </div>
        </div>
      </div>
    </div>

    <!-- 操作区 -->
    <div class="flex gap-4 max-w-md mx-auto">
      <van-button
        :class="userReadyStatus ? 'bg-gray-500 hover:bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700'"
        class="flex-1"
        @click="handleToggleReady"
      >
        {{
          userReadyStatus ? "取消准备" : "准备"
        }}
      </van-button>

      <van-button
        v-if="isHost"
        class="flex-1 bg-green-600 hover:bg-green-700"
        @click="handleStartGame"
      >
        开始游戏
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.room-page {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  width: 100%;
}

:deep(.van-button) {
  border-radius: 8px;
  height: 44px;
  font-size: 16px;
}
</style>
