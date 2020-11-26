type media = {
  tweet_time: string
  tweet_url: string
  file_name: string
  media_type: string
  media_url: string
}

type VideoVariant = {
  bitrate?: number | null
  content_type: string
  url: string
}
