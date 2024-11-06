export interface IBaseImageItem {
  complete_time: string;
  digest: string;
  full_repo_name: string;
  id: number;
  image_type: number;
  library: string;
  questions?: [];
  tags: string;
  risk_score: number;
  registry_name: string;
  registry_deleted_at: number;
}

export enum ImageType {
  BASE = 'base',
  APP = 'app',
}

export interface IRepoItem {
  id: string;
  auth_str: string;
  created_at: string;
  description: string;
  name: string;
  password: string;
  reg_type: string;
  sync_interval: string;
  token: string;
  updated_at: string;
  url: string;
  username: string;
  access_key?: string;
  access_secret?: string;
  region_id?: string;
  instance_id?: string;
}
