<script
  lang="ts"
  setup
>
import {computed, ref} from "vue"
import {useRouter} from "vue-router"
import {useRoomStore} from "@/store/modules/room.store.ts"
import {showToast} from "vant"

const roomStore = useRoomStore()
const router = useRouter()

// 表单状态
const roomName = ref("")
const searchRoomId = ref("")

// 搜索过滤房间列表
const filteredRooms = computed(() => {
  const searchId = searchRoomId.value.trim().toLowerCase()
  if (!searchId) return roomStore.availableRooms

  return roomStore.availableRooms.filter(room =>
    room.id.toLowerCase().includes(searchId)
  )
})

// 创建房间
const handleCreateRoom = () => {
  const roomId = roomStore.createRoom(roomName.value || `房间-${Date.now().toString().slice(-4)}`)
  showToast(`房间创建成功：${roomId}`)
  router.push("/room")
}

// 搜索并加入房间
const handleSearchRoom = () => {
  const roomId = searchRoomId.value.trim()
  if (!roomId) {
    showToast("请输入房间ID")
    return
  }

  const result = roomStore.joinRoom(roomId)
  if (result.success) {
    router.push("/room")
  } else {
    showToast(result.message)
  }
}

// 从列表加入房间
const handleJoinFromList = (roomId: string) => {
  const result = roomStore.joinRoom(roomId)
  if (result.success) {
    router.push("/room")
  } else {
    showToast(result.message)
  }
}
</script>

<template>
  <div class="lobby-page min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 flex flex-col">
    <!-- 主内容区 -->
    <div class="container flex-1 max-w-4xl w-full mx-auto px-4 py-6">
      <!-- 标题 -->
      <div class="text-center">
        <h1 class="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-indigo-800">
          游戏大厅</h1>
        <p class="text-indigo-600/70 mt-2">选择房间或创建新房间开始游戏</p>
      </div>

      <!-- 操作区 - 使用明确的布局 -->
      <div class="grid grid-cols-2 gap-6 mb-4">
        <!-- 创建房间卡片 -->
        <div class="">
          <div class="p-5">
            <h2 class="text-xl font-semibold text-indigo-700 mb-4">创建房间</h2>
            <van-field
              v-model="roomName"
              class="mb-4"
              clearable
              placeholder="可选：输入房间名称"
            />
            <van-button
              class="w-full bg-indigo-600 hover:bg-indigo-700"
              @click="handleCreateRoom"
            >
              创建新房间
            </van-button>
          </div>
        </div>

        <!-- 搜索房间卡片 -->
        <div class="">
          <div class="p-5">
            <h2 class="text-xl font-semibold text-indigo-700 mb-4">搜索房间</h2>
            <van-field
              v-model="searchRoomId"
              :suffix="searchRoomId ? 'clearButton' : null"
              class="mb-4"
              clearable
              placeholder="输入房间ID搜索"
            />
            <van-button
              class="w-full bg-green-600 hover:bg-green-700"
              @click="handleSearchRoom"
            >
              加入房间
            </van-button>
          </div>
        </div>
      </div>

      <!-- 房间列表 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-indigo-700 mb-4 flex items-center">
          <span class="mr-2">🏠</span>
          可加入房间
          <span
            v-if="searchRoomId"
            class="ml-2 text-sm text-gray-500"
          >
            (搜索: {{
              searchRoomId
            }})
          </span>
        </h2>

        <!-- 搜索结果为空时显示 -->
        <div
          v-if="searchRoomId && filteredRooms.length === 0"
          class="bg-white rounded-xl p-6 text-center text-gray-500 shadow"
        >
          未找到房间ID包含 "{{
            searchRoomId
          }}" 的房间
        </div>

        <!-- 房间列表 -->
        <div
          v-else-if="filteredRooms.length > 0"
          class="bg-white rounded-xl shadow overflow-hidden"
        >
          <div
            v-for="room in filteredRooms"
            :key="room.id"
            class="flex justify-between items-center p-4 border-b last:border-0 hover:bg-indigo-50 transition-colors"
          >
            <div>
              <div class="font-medium text-indigo-800">{{
                  room.name || `房间 ${room.id}`
                                                       }}
              </div>
              <div class="text-sm text-gray-500 mt-1">房间ID: {{
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
              <van-button
                plain
                size="small"
                type="primary"
                @click="handleJoinFromList(room.id)"
              >加入
              </van-button>
            </div>
          </div>
        </div>

        <!-- 无房间时显示 -->
        <div
          v-else
          class="bg-white rounded-xl p-6 text-center text-gray-500 shadow"
        >
          当前没有可加入的房间，请创建新房间
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lobby-page {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  width: 100%;
}

</style>
