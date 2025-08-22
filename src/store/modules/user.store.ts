import { defineStore } from "pinia"
import { computed, ref, onMounted } from "vue"
import { v4 as uuidv4 } from "uuid"

export const useUserStore = defineStore(
    "user",
    () => {
        // 状态管理
        const userId = ref("") // 用户唯一标识
        const username = ref("") // 用户名
        const avatar = ref("") // 头像URL
        const lastLogin = ref<Date | null>(null) // 最后登录时间

        // 初始化：从持久化数据加载或创建新用户ID
        onMounted(() => {
            // 如果没有用户ID，创建一个新的唯一ID
            if (!userId.value) {
                userId.value = uuidv4()
            }

            // 记录当前登录时间
            lastLogin.value = new Date()
        })

        // 计算属性
        const isLoggedIn = computed(() => !!username.value.trim())
        const userInfo = computed(() => ({
            userId: userId.value,
            username: username.value,
            avatar: avatar.value,
            lastLogin: lastLogin.value,
            isLoggedIn: isLoggedIn.value
        }))

        // 行动：设置用户名
        const setUsername = (name: string) => {
            const trimmedName = name.trim()
            if (trimmedName.length >= 2 && trimmedName.length <= 10) {
                username.value = trimmedName
                return true // 设置成功
            }
            return false // 设置失败（不符合长度要求）
        }

        // 行动：设置头像
        const setAvatar = (url: string) => {
            avatar.value = url
        }

        // 行动：生成默认头像（基于用户名首字母）
        const generateDefaultAvatar = () => {
            if (!username.value) return

            // 简单的默认头像生成逻辑（实际项目中可替换为真实头像服务）
            const firstChar = username.value.charAt(0).toUpperCase()
            // 使用picsum生成基于首字母的占位头像
            avatar.value = `https://picsum.photos/seed/${firstChar}${userId.value}/200`
        }

        // 行动：清除用户信息（退出场景）
        const clearUser = () => {
            username.value = ""
            avatar.value = ""
            // 保留userId，作为用户唯一标识
        }

        // 行动：更新最后活跃时间
        const updateLastActive = () => {
            lastLogin.value = new Date()
        }

        return {
            userId,
            username,
            avatar,
            lastLogin,
            isLoggedIn,
            userInfo,
            setUsername,
            setAvatar,
            generateDefaultAvatar,
            clearUser,
            updateLastActive
        }
    },
    {
        // 持久化配置
        persist: {
            key: "suit-streak-user",
            storage: localStorage,
            // 自定义序列化（处理Date对象）
            serializer: {
                serialize: (value) => {
                    // 将Date对象转换为ISO字符串
                    return JSON.stringify({
                        ...value,
                        lastLogin: value.lastLogin?.toISOString()
                    })
                },
                deserialize: (value) => {
                    const parsed = JSON.parse(value)
                    // 将ISO字符串转换回Date对象
                    if (parsed.lastLogin) {
                        parsed.lastLogin = new Date(parsed.lastLogin)
                    }
                    return parsed
                }
            }
        }
    }
)
