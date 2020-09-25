import axios from "axios"
import { data } from "./wp"

const API_URL = `${data.rest_url}/wp/v2`

let wp_posts_cache = []

function loadCachedPosts() {
  if (wp_posts_cache.length > 0) {
    return wp_posts_cache
  } else {
    return []
  }
}

async function getPosts() {
  let posts = []
  const res = await axios.get(`${API_URL}/posts?per_page=1&_fields=id`)
  let totalPages = Math.ceil(res.headers["x-wp-total"] / 100)
  let arr = []
  for (let i = 1; i <= totalPages; i++) {
    arr[i - 1] = i
  }
  await Promise.all(
    arr.map(async page => {
      const res = await axios.get(
        `${API_URL}/posts?page=${page}&per_page=100&_fields=id,title`
      )
      posts = posts.concat(res.data)
    })
  )
  wp_posts_cache = posts.map(post => ({
    ...post,
    title: post.title.rendered,
  }))
  return wp_posts_cache
}

async function getPostById(id) {
  return axios
    .get(`${API_URL}/posts/${id}?_fields=id,title,content`)
    .then(res => res.data)
    .then(parsePost)
}

export default { loadCachedPosts, getPosts, getPostById }

const parsePost = post => ({
  ...post,
  content: post.content.rendered,
  title: post.title.rendered,
})
