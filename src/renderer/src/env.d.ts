/// <reference types="vite/client" />

// 声明资源文件导入类型
declare module '*?asset' {
  const src: string
  export default src
}

// 声明音频文件类型
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
