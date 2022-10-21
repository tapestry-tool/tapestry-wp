import axios from "axios"
import { data } from "./wp"

const API_URL = `${data.rest_url}/wp/v2`
const ADMIN_AJAX_URL = data.adminAjaxUrl

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

/**
 * Rebuild caches for all H5P content that need their caches rebuilt.
 */
async function rebuildAllH5PCache() {
  let needsRebuilding = 1
  do {
    // Each call to h5p_rebuild_cache rebuilds as many as possible within 5 seconds
    // And returns the number of contents that still need rebuilding
    const response = await axios.post(`${ADMIN_AJAX_URL}?action=h5p_rebuild_cache`)
    needsRebuilding = parseInt(response.data)
  } while (needsRebuilding > 0)
}

export default { loadCachedPosts, getPosts, getPostById, rebuildAllH5PCache }

const parsePost = post => ({
  ...post,
  content: post.content.rendered,
  title: post.title.rendered,
})
