import {defineStore} from "pinia"
import {computed, ref} from "vue"

export const useUserStore = defineStore(
    "user",
    () => {
        // 状态：用户名（从localStorage初始化）
        const username = ref("")

        // 计算属性：判断用户是否已登录
        const isLoggedIn = computed(() => !!username.value.trim())

        // 行动：设置用户名（并触发持久化）
        const setUsername = (name: string) => {
            username.value = name.trim()
        }

        // 行动：清除用户信息（退出场景）
        const clearUser = () => {
            username.value = ""
        }

        return {
            username,
            isLoggedIn,
            setUsername,
            clearUser,
        }
    },
    {
        // 启用持久化到localStorage
        persist: {
            key: "suit-streak-user", // 存储键名
            storage: localStorage,
        },
    }
)
