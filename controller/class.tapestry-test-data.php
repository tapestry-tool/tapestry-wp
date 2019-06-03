<?php

require __DIR__ . '/class.tapestry-controller.php';

/**
 * Tapestry Endpoint Permissions
 *
 */
class TapestryTestData
{
    private $_testTapestryData = '{
        "settings": {
            "tapestrySlug": "intercultural-understanding",
            "saveProgressToCookie": false,
            "zoom": 1,
            "type": "tapestry",
            "title": "Seed Data Set Up",
            "status": "publish"
        },
        "groups": [],
        "nodes": [
    {
        "nodeType": "",
        "title": "Intercultural Understanding",
        "imageURL": "https://beta.tapestry-tool.com/wp-content/uploads/2018/10/intercultural-understanding-resized.png",
        "mediaType": "video",
        "mediaFormat": "mp4",
        "mediaDuration": 232,
        "typeId": 1,
        "group": 1,
        "typeData": {
            "progress": [
                {"group": "viewed", "value": 0},
                {"group": "unviewed", "value": 1}
            ],
            "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/MAIN.mp4",
            "mediaWidth": 960,
            "mediaHeight": 600,
            "unlocked": true
        },
        "userTypes": {
            "admin": "normal",
            "consumer": "normal",
            "editor": "optional"
        },
        "fx": 800,
        "fy": 470
    },
    {

            "nodeType": "",
            "title": "Segregation and Homophily",
            "imageURL": "https://beta.tapestry-tool.com/wp-content/uploads/2018/10/segregation-homophily-resized.png",
            "mediaType": "video",
            "mediaFormat": "mp4",
            "mediaDuration": 232,
            "typeId": 2,
            "group": 2,
            "typeData": {
                "progress": [
                    {"group": "viewed", "value": 0},
                    {"group": "unviewed", "value": 1}
                ],
                "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/SEG-HOMPH.mp4",
                "mediaWidth": 960,
                "mediaHeight": 600,
                "unlocked": false
            },
            "userTypes": {
                "admin": "normal",
                "consumer": "hidden",
                "editor": "optional"
            },
            "fx": 450,
            "fy": 150
        },
        {
            "nodeType": "",
            "title": "Contact and Minorities",
            "imageURL": "https://beta.tapestry-tool.com/wp-content/uploads/2018/10/contact-and-minorities-resized.png",
            "mediaType": "video",
            "mediaFormat": "mp4",
            "mediaDuration": 232,
            "typeId": 1,
            "group": 2,
            "typeData": {
                "progress": [
                    {"group": "viewed", "value": 0},
                    {"group": "unviewed", "value": 1}
                ],
                "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/CT-AND-MINORITIES.mp4",
                "mediaWidth": 960,
                "mediaHeight": 600,
                "unlocked": false
            },
            "userTypes": {
                "admin": "normal",
                "consumer": "hidden",
                "editor": "optional"
            },
            "fx": 450,
            "fy": 700
        },
        {
            "nodeType": "",
            "title": "What is a Minority?",
            "imageURL": "https://beta.tapestry-tool.com/wp-content/uploads/2018/10/minority-resized.png",
            "mediaType": "video",
            "mediaFormat": "mp4",
            "mediaDuration": 232,
            "typeId": 1,
            "group": 2,
            "typeData": {
                "progress": [
                    {"group": "viewed", "value": 0},
                    {"group": "unviewed", "value": 1}
                ],
                "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/CT-DEFINING-MINORITIES.mp4",
                "mediaWidth": 960,
                "mediaHeight": 600,
                "unlocked": false
            },
            "userTypes": {
                "admin": "normal",
                "consumer": "hidden",
                "editor": "optional"
            },
            "fx": 100,
            "fy": 470
        },
        {
            "nodeType": "",
            "title": "Contact Theory",
            "imageURL": "https://beta.tapestry-tool.com/wp-content/uploads/2018/10/ct0-resized.png",
            "mediaType": "video",
            "mediaFormat": "mp4",
            "mediaDuration": 232,
            "typeId": 1,
            "group": 2,
            "typeData": {
                "progress": [
                    {"group": "viewed", "value": 0},
                    {"group": "unviewed", "value": 1}
                ],
                "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/CT.mp4",
                "mediaWidth": 960,
                "mediaHeight": 600,
                "unlocked": false
            },
            "userTypes": {
                "admin": "normal",
                "consumer": "hidden",
                "editor": "optional"
            },
            "fx": 1200,
            "fy": 470
        },
        {
            "nodeType": "",
            "title": "Colourblind / Race-acknowledgement",
            "imageURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/thumbs/CLRBLND-RACE.png",
            "mediaType": "video",
            "mediaFormat": "mp4",
            "mediaDuration": 232,
            "typeId": 1,
            "group": 2,
            "typeData": {
                "progress": [
                    {"group": "viewed", "value": 0},
                    {"group": "unviewed", "value": 1}
                ],
                "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/COLORBLIND-VS-RACE-ACK.mp4",
                "mediaWidth": 960,
                "mediaHeight": 600,
                "unlocked": false
            },
            "userTypes": {
                "admin": "normal",
                "consumer": "hidden",
                "editor": "optional"
            },
            "fx": 1550,
            "fy": 150
        },
        {
            "nodeType": "",
            "title": "Structured Conversations",
            "imageURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/thumbs/STRUCTURED-CONV.png",
            "mediaType": "video",
            "mediaFormat": "mp4",
            "mediaDuration": 232,
            "typeId": 1,
            "group": 2,
            "typeData": {
                "progress": [
                    {"group": "viewed", "value": 0},
                    {"group": "unviewed", "value": 1}
                ],
                "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/STRUCTURED-CONVERSATIONS.mp4",
                "mediaWidth": 960,
                "mediaHeight": 600,
                "unlocked": false
            },
            "userTypes": {
                "admin": "normal",
                "consumer": "hidden",
                "editor": "optional"
            },
            "fx": 1880,
            "fy": 470
        },
        {
            "nodeType": "",
            "title": "How It Works",
            "imageURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/thumbs/HOW-IT-WORKS.png",
            "mediaType": "video",
            "mediaFormat": "mp4",
            "mediaDuration": 232,
            "typeId": 1,
            "group": 2,
            "typeData": {
                "progress": [
                    {"group": "viewed", "value": 0},
                    {"group": "unviewed", "value": 1}
                ],
                "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/HOW-IT-WORKS.mp4",
                "mediaWidth": 960,
                "mediaHeight": 600,
                "unlocked": false
            },
            "userTypes": {
                "admin": "normal",
                "consumer": "hidden",
                "editor": "optional"
            },
            "fx": 1550,
            "fy": 700
        },
        {
            "nodeType": "",
            "title": "Perspective-Taking / Empathy",
            "imageURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/thumbs/PERSP-TAKING-EMPATHY.png",
            "mediaType": "video",
            "mediaFormat": "mp4",
            "mediaDuration": 232,
            "typeId": 1,
            "group": 2,
            "typeData": {
                "progress": [
                    {"group": "viewed", "value": 0},
                    {"group": "unviewed", "value": 1}
                ],
                "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/PERSPECTIVE-EMPATHY.mp4",
                "mediaWidth": 960,
                "mediaHeight": 600,
                "unlocked": false
            },
            "userTypes": {
                "admin": "normal",
                "consumer": "hidden",
                "editor": "optional"
            },
            "fx": 2100,
            "fy": 700
        },
        {
            "nodeType": "",
            "title": "Perspective-Taking and Contact Theory",
            "imageURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/thumbs/PT-AND-CT.png",
            "mediaType": "video",
            "mediaFormat": "mp4",
            "mediaDuration": 232,
            "typeId": 1,
            "group": 2,
            "typeData": {
                "progress": [
                    {"group": "viewed", "value": 0},
                    {"group": "unviewed", "value": 1}
                ],
                "mediaURL": "https://tapestry-vid.sfo2.cdn.digitaloceanspaces.com/ICUS/PT-AND-CT.mp4",
                "mediaWidth": 960,
                "mediaHeight": 600,
                "unlocked": false
            },
            "userTypes": {
                "admin": "normal",
                "consumer": "hidden",
                "editor": "optional"
            },
            "fx": 2100,
            "fy": 150
        }
    ],
    "links": [
        {"source": 1, "target": 2, "value": 1, "type": "", "appearsAt": 100 },
        {"source": 1, "target": 3, "value": 1, "type": "", "appearsAt": 130 },
        {"source": 1, "target": 4, "value": 1, "type": "", "appearsAt": 150 },
        {"source": 1, "target": 5, "value": 1, "type": "", "appearsAt": 200 },
        {"source": 5, "target": 6, "value": 2, "type": "", "appearsAt": 100 },
        {"source": 5, "target": 9, "value": 2, "type": "", "appearsAt": 100 },
        {"source": 5, "target": 8, "value": 2, "type": "", "appearsAt": 100 },
        {"source": 9, "target": 7, "value": 2, "type": "", "appearsAt": 100 },
        {"source": 7, "target": 10, "value": 2, "type": "", "appearsAt": 100 },
        {"source": 6, "target": 8, "value": 2, "type": "", "appearsAt": 100 }
    ]
    }';

    /**
     * Post Tapestry Test Data
     * 
     *
     * @return Object response
     */
    public function addSeedData()
    {
        $data = json_decode($_testTapestryData);
        $tapestryController = new TapestryController();
        return $tapestryController->updateTapestry($data);
    }

}
