type media = {
  tweet_url: string
  tweet_time: string
  file_name: string
  media_type: string
  media_url: string
  save_time: string
}

type VideoVariant = {
  bitrate?: number | null
  content_type: string
  url: string
}

type resources = {
  media_url: string
  file_name: string
  media_extension: string
}
