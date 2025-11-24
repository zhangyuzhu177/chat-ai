export enum SysConfig {
  SDK = 'sdk',
}

export interface ConfigDto {
  [SysConfig.SDK]: {
    apiKey: string
    baseURL: string
  }
}