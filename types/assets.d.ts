// 全局资源文件类型声明

// Vite 资源导入类型
declare module '*?asset' {
  const src: string
  export default src
}

// 音频文件类型声明
declare module '*.mp3' {
  const src: string
  export default src
}

declare module '*.wav' {
  const src: string
  export default src
}

declare module '*.ogg' {
  const src: string
  export default src
}

declare module '*.m4a' {
  const src: string
  export default src
}

// 图片文件类型声明（可能也需要）
declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.ico' {
  const src: string
  export default src
}