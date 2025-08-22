<script
  lang="ts"
  setup
>
import {ref} from "vue"
import {useRouter} from "vue-router"
import {useRoomStore} from "@/store/modules/room.store.ts"
import {Button, Card, Field, List, showToast} from "vant"

const roomStore = useRoomStore()
const router = useRouter()

// 表单状态
const roomName = ref("")
const joinRoomId = ref("")

// 创建房间
const handleCreateRoom = () => {
  const roomId = roomStore.createRoom(roomName.value)
  // 修正：使用showToast替代Toast
  showToast(`房间创建成功：${roomId}`)
  router.push("/room")
}

// 加入房间
const handleJoinRoom = () => {
  if (!joinRoomId.value.trim()) {
    // 修正：使用showToast替代Toast
    showToast("请输入房间ID")
    return
  }
  const result = roomStore.joinRoom(joinRoomId.value.trim())
  if (result.success) {
    router.push("/room")
  } else {
    // 修正：使用showToast替代Toast
    showToast(result.message)
  }
}

// 从列表加入房间
const handleJoinFromList = (roomId: string) => {
  const result = roomStore.joinRoom(roomId)
  if (result.success) {
    router.push("/room")
  } else {
    // 修正：使用showToast替代Toast
    showToast(result.message)
  }
}
</script>

<template>
  <div class="lobby-page min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 p-4 md:p-6">
    <!-- 标题 -->
    <div class="text-center mb-8">
      <h1 class="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-indigo-800">
        游戏大厅</h1>
      <p class="text-indigo-600/70 mt-2">选择房间或创建新房间开始游戏</p>
    </div>

    <!-- 操作区 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
      <!-- 创建房间卡片 -->
      <Card class="p-5 shadow-lg">
        <h2 class="text-xl font-semibold text-indigo-700 mb-4">创建房间</h2>
        <!-- 修正：将Input替换为Field -->
        <Field
          v-model="roomName"
          class="mb-4"
          clearable
          placeholder="可选：输入房间名称"
        />
        <Button
          class="w-full bg-indigo-600 hover:bg-indigo-700"
          @click="handleCreateRoom"
        >
          创建新房间
        </Button>
      </Card>

      <!-- 加入房间卡片 -->
      <Card class="p-5 shadow-lg">
        <h2 class="text-xl font-semibold text-indigo-700 mb-4">加入房间</h2>
        <!-- 修正：将Input替换为Field -->
        <Field
          v-model="joinRoomId"
          class="mb-4"
          clearable
          placeholder="输入房间ID"
        />
        <Button
          class="w-full bg-green-600 hover:bg-green-700"
          @click="handleJoinRoom"
        >
          加入房间
        </Button>
      </Card>
    </div>

    <!-- 房间列表 -->
    <div class="max-w-3xl mx-auto">
      <h2 class="text-xl font-semibold text-indigo-700 mb-4 flex items-center">
        <span class="mr-2">🏠</span>
        可加入房间
      </h2>
      <List
        v-if="roomStore.availableRooms.length > 0"
        class="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div
          v-for="room in roomStore.availableRooms"
          :key="room.id"
          class="flex justify-between items-center p-4 border-b last:border-0 hover:bg-indigo-50 transition-colors"
        >
          <div>
            <div class="font-medium text-indigo-800">{{
                room.name || `房间 ${room.id}`
                                                     }}
            </div>
            <div class="text-sm text-gray-500 mt-1">
              房间ID: {{
                room.id
              }}
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              {{
                room.players.length
              }}/{{
                room.maxPlayers
              }}
            </span>
            <Button
              size="small"
              @click="handleJoinFromList(room.id)"
            >
              加入
            </Button>
          </div>
        </div>
      </List>
      <div
        v-else
        class="text-center py-8 text-gray-500 bg-white rounded-xl shadow-md"
      >
        当前没有可加入的房间，请创建新房间
      </div>
    </div>
  </div>
</template>

<style scoped>
.lobby-page {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

:deep(.van-card) {
  border-radius: 12px;
  border: none;
}

:deep(.van-button) {
  border-radius: 8px;
  height: 44px;
  font-size: 16px;
}

/* 新增Field组件样式 */
:deep(.van-field) {
  border-radius: 8px;
  background-color: #f9fafb;
}
</style>
