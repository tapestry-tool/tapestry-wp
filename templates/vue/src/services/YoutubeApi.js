import axios from 'axios'
import moment from 'moment'
import { YOUTUBE_API_KEY } from "../../config"

const BASE_URL = "https://www.googleapis.com/youtube/v3"

async function getDuration(id){
    const response = await axios({
        method: "GET",
        url: BASE_URL + "/videos",
        params: {
            part: "contentDetails",
            id: id,
            key: YOUTUBE_API_KEY,
        }
    })
    return moment.duration(response.data.items[0].contentDetails.duration, moment.ISO_8601).asSeconds()
}

export default {
    getDuration
}