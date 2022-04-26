declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string
      GUILD: string
    }
  }
}

export {}
