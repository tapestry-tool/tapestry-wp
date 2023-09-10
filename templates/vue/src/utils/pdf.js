import { jsPDF } from "jspdf"
import moment from "moment"
import "./pdf.WorkSans.font"
import CertificateTemplate from "@/assets/certificate-template.png"
import SummaryBackground from "@/assets/summary-background.png"
import ChoicesIcon from "@/assets/icons/tyde/profile/choices.png"
import HobbiesIcon from "@/assets/icons/tyde/profile/hobbies.png"
import InterestsIcon from "@/assets/icons/tyde/profile/interests.png"
import PreferencesIcon from "@/assets/icons/tyde/profile/preferences.png"
import QualitiesIcon from "@/assets/icons/tyde/profile/qualities.png"
import SkillsIcon from "@/assets/icons/tyde/profile/skills.png"
import StrengthsIcon from "@/assets/icons/tyde/profile/strengths.png"
import Helpers from "./Helpers"
import * as wp from "@/services/wp"

/* CONSTANTS */

const fontSizes = {
  title: 22,
  subtitle: 18,
  body: 14,
  small: 12,
}

const boxSizes = {
  sm: {
    w: 2.6,
    h: 0.65,
  },
  md: {
    w: 2.6,
    h: 0.8,
  },
  lg: {
    w: 2.6,
    h: 1.2,
  },
}

const paddings = {
  sm: 0.2,
  md: 0.4,
  lg: 0.6,
}

/* UTILITY FUNCTIONS */

const getUserFullName = () => {
  const userData = wp.data.currentUser.data
  if (userData.first_name && userData.last_name) {
    return `${userData.first_name} ${userData.last_name}`
  }
  return userData.display_name
}

const addImage = (doc, imageSrc, x, y, w, h) => {
  const img = new Image()
  img.src = Helpers.getImagePath(imageSrc)
  doc.addImage(img, "PNG", x, y, w, h)
}

const drawBox = (doc, base, boxSize, options = {}) => {
  const {
    fillColor = "#ffffff",
    layout = "y",
    padding = 0,
    text = null,
    fontSize = null,
    textAlign = null,
    icon = null,
    iconSize = boxSize.h - paddings.sm * 2,
    borderRadius = Math.min(boxSize.w, boxSize.h) * 0.25,
  } = options
  doc.setFillColor(fillColor)
  doc.roundedRect(
    base.x,
    base.y,
    boxSize.w,
    boxSize.h,
    borderRadius,
    borderRadius,
    "F"
  )
  if (icon) {
    addImage(
      doc,
      icon,
      base.x + paddings.sm,
      base.y + boxSize.h / 2 - iconSize / 2,
      iconSize,
      iconSize
    )
  }
  if (text) {
    if (fontSize) {
      doc.setFontSize(fontSize)
    }
    doc.text(
      text,
      base.x + paddings.sm + (icon ? iconSize + paddings.sm : 0),
      base.y + boxSize.h / 2,
      {
        align: textAlign ?? "left",
        maxWidth: boxSize.w - paddings.sm * 2,
        baseline: "middle",
      }
    )
  }
  if (layout === "y" || layout === "both") {
    base.y += boxSize.h + padding
  }
  if (layout === "x" || layout === "both") {
    base.x += boxSize.w + padding
  }
}

const addToList = (list, potentialItems) => {
  if (potentialItems && Array.isArray(potentialItems)) {
    list.push(...potentialItems)
  }
}

/* PDF GENERATION FUNCTIONS */

const generateCertificate = () => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "in",
    format: [13.02, 18.23],
  })

  addImage(doc, CertificateTemplate, 0, 0, 18.23, 13.02)

  doc.setFont("WorkSans", "normal", "normal")
  doc.setFontSize(62)
  doc.text(getUserFullName(), 18.23 / 2, 6.5, { align: "center" })

  doc.setFontSize(28)
  const dateStr = moment().format("MMMM D, YYYY")
  doc.text(dateStr, 10.05, 11.05, { align: "center" })

  return doc
}

const generateSummary = (avatarImg, profileSummary) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [11.54, 16.14],
  })

  doc.setFont("WorkSans", "normal", "normal")

  addImage(doc, SummaryBackground, 0, 0, 11.54, 16.14)

  doc.setFillColor("#ffffff")
  drawBox(doc, { x: 1, y: 1 }, { w: 5.8, h: 2 }, { borderRadius: 0.3 })

  doc.setFontSize(fontSizes.title)
  doc.text(getUserFullName(), 3, 1.85, { align: "left" })
  doc.setFontSize(fontSizes.body)
  doc.text("Profile Summary", 3, 2.35, { align: "left" })

  doc.addImage(avatarImg, "JPEG", 1.2, 1.1, 1.6, 1.6) // the y is smaller because the avatar image has a bit of padding on top

  let base

  // Hobbies
  base = {
    x: 7.8,
    y: 1,
  }
  drawBox(doc, base, boxSizes.md, {
    layout: "y",
    padding: paddings.sm,
    text: "Hobbies",
    fontSize: fontSizes.subtitle,
    textAlign: "left",
    icon: HobbiesIcon,
  })
  drawBox(doc, base, boxSizes.sm, {
    layout: "y",
    padding: paddings.sm,
    text: profileSummary?.["My Hobbies"]?.["Favorite hobby"]?.text?.[0] ?? "N/A",
    fontSize: fontSizes.body,
    textAlign: "left",
  })
  drawBox(doc, base, boxSizes.sm, {
    layout: "y",
    padding: paddings.sm,
    text: profileSummary?.["My Hobbies"]?.["Second hobby"]?.text?.[0] ?? "N/A",
    fontSize: fontSizes.body,
    textAlign: "left",
  })
  const hobbiesEndY = base.y

  // Strengths
  base = {
    x: 1,
    y: 3.5,
  }
  drawBox(doc, base, boxSizes.lg, {
    layout: "y",
    padding: paddings.sm,
    text: "Strengths",
    fontSize: fontSizes.subtitle,
    textAlign: "left",
    icon: StrengthsIcon,
    iconSize: 0.4,
  })
  drawBox(doc, base, boxSizes.sm, {
    layout: "y",
    padding: paddings.sm,
    text:
      profileSummary?.["My Strengths"]?.["Strengths 2_first one"]?.text?.[0] ??
      "N/A",
    fontSize: fontSizes.body,
    textAlign: "left",
  })
  drawBox(doc, base, boxSizes.sm, {
    layout: "y",
    padding: paddings.sm,
    text:
      profileSummary?.["My Strengths"]?.["Strengths 5_2nd one"]?.text?.[0] ?? "N/A",
    fontSize: fontSizes.body,
    textAlign: "left",
  })
  drawBox(doc, base, boxSizes.sm, {
    layout: "y",
    padding: paddings.sm,
    text:
      profileSummary?.["My Strengths"]?.["Strengths 8_3rd one"]?.text?.[0] ?? "N/A",
    fontSize: fontSizes.body,
    textAlign: "left",
  })
  const strengthsEndY = base.y

  // Interests
  base = {
    x: 1 + boxSizes.sm.w + paddings.lg,
    y: 3.5,
  }
  drawBox(doc, base, boxSizes.lg, {
    layout: "y",
    padding: paddings.sm,
    text: "Interests",
    fontSize: fontSizes.subtitle,
    textAlign: "left",
    icon: InterestsIcon,
    iconSize: 0.4,
  })
  const userInterests = profileSummary?.["My Interests"]?.["Top interests"]?.text
  if (userInterests && Array.isArray(userInterests) && userInterests.length <= 3) {
    for (const interest of userInterests) {
      drawBox(doc, base, boxSizes.sm, {
        layout: "y",
        padding: paddings.sm,
        text: interest,
        fontSize: fontSizes.body,
        textAlign: "left",
      })
    }
  }

  // Choices
  let choicesList = []
  addToList(
    choicesList,
    profileSummary?.["My Choices"]?.["Choices and support"]?.multipleChoice
  )
  addToList(
    choicesList,
    profileSummary?.["My Choices"]?.["Choices number of options"]?.multipleChoice
  )
  choicesList = choicesList.map(
    choice =>
      "I like having " + choice.substring(0, 1).toLowerCase() + choice.substring(1)
  )
  const choicesBeginY = hobbiesEndY + paddings.lg
  const choicesBoxHeight = strengthsEndY - paddings.sm - choicesBeginY
  drawBox(
    doc,
    { x: 7.8, y: choicesBeginY },
    { w: boxSizes.lg.w, h: choicesBoxHeight },
    { borderRadius: 0.3 }
  )
  addImage(
    doc,
    ChoicesIcon,
    7.8 + paddings.sm,
    choicesBeginY + paddings.sm,
    0.4,
    0.4
  )
  doc.setFontSize(fontSizes.subtitle)
  doc.text("Choices", 7.8 + paddings.sm + 0.5, choicesBeginY + paddings.sm + 0.08, {
    align: "left",
    baseline: "top",
  })
  doc.setFontSize(fontSizes.small)
  doc.text(
    choicesList.map(v => "- " + v),
    7.8 + paddings.md,
    choicesBeginY + paddings.md + paddings.lg,
    {
      align: "left",
      baseline: "top",
      maxWidth: boxSizes.lg.w - paddings.md * 2,
      lineHeightFactor: 1.5,
    }
  )

  const bottomBoxY = strengthsEndY + paddings.lg
  const bottomBoxWidth = 2.73
  const bottomBoxHeight = 16.14 - bottomBoxY - paddings.lg
  let bottomBoxX = 1

  // Skills
  base = {
    x: bottomBoxX,
    y: bottomBoxY,
  }
  const skillsList = []
  addToList(
    skillsList,
    profileSummary?.["My Skills"]?.["skills in the following main areas"]
      ?.multipleChoice
  )
  addToList(
    skillsList,
    profileSummary?.["My Skills"]?.["I also have skills in"]?.multipleChoice
  )
  addToList(
    skillsList,
    profileSummary?.["My Skills"]?.["Skills 2 confidence "]?.multipleChoice
  )
  drawBox(
    doc,
    base,
    { w: bottomBoxWidth, h: bottomBoxHeight },
    { layout: "x", padding: paddings.lg, borderRadius: 0.3 }
  )
  addImage(doc, SkillsIcon, bottomBoxX + 0.3, bottomBoxY + 0.3, 0.4, 0.4)
  doc.setFontSize(fontSizes.subtitle)
  doc.text("Skills", bottomBoxX + paddings.md + 0.5, bottomBoxY + paddings.md, {
    align: "left",
    baseline: "top",
  })
  doc.setFontSize(fontSizes.small)
  doc.text(
    skillsList.map(v => "- " + v),
    bottomBoxX + paddings.md,
    bottomBoxY + paddings.md + paddings.lg,
    {
      align: "left",
      baseline: "top",
      maxWidth: bottomBoxWidth - paddings.md * 2,
      lineHeightFactor: 1.5,
    }
  )

  // Preferences
  const preferencesList = []
  addToList(
    preferencesList,
    profileSummary?.["My Preferences"]?.["Preferences in communicating with others"]
      ?.multipleChoice
  )
  addToList(
    preferencesList,
    profileSummary?.["My Preferences"]?.["Preferences learning new things"]
      ?.multipleChoice
  )
  addToList(
    preferencesList,
    profileSummary?.["My Preferences"]?.["Preferences learning with others"]
      ?.multipleChoice
  )
  addToList(
    preferencesList,
    profileSummary?.["My Preferences"]?.["Preferences with chores"]?.multipleChoice
  )
  addToList(
    preferencesList,
    profileSummary?.["My Preferences"]?.["Preferences with communicating"]
      ?.multipleChoice
  )
  bottomBoxX = base.x
  drawBox(
    doc,
    base,
    { w: bottomBoxWidth, h: bottomBoxHeight },
    { layout: "x", padding: paddings.lg, borderRadius: 0.3 }
  )
  addImage(doc, PreferencesIcon, bottomBoxX + 0.3, bottomBoxY + 0.3, 0.4, 0.4)
  doc.setFontSize(fontSizes.subtitle)
  doc.text("Preferences", bottomBoxX + paddings.md + 0.5, bottomBoxY + paddings.md, {
    align: "left",
    baseline: "top",
  })
  doc.setFontSize(fontSizes.small)
  doc.text(
    preferencesList.map(v => "- " + v),
    bottomBoxX + paddings.md,
    bottomBoxY + paddings.md + paddings.lg,
    {
      align: "left",
      baseline: "top",
      maxWidth: bottomBoxWidth - paddings.md * 2,
      lineHeightFactor: 1.5,
    }
  )

  // Qualities
  const qualitiesList = []
  addToList(
    qualitiesList,
    profileSummary?.["My Best Qualities"]?.["Best qualities 1"]?.multipleChoice
  )
  addToList(
    qualitiesList,
    profileSummary?.["My Best Qualities"]?.["Best qualities 2"]?.multipleChoice
  )
  addToList(
    qualitiesList,
    profileSummary?.["My Best Qualities"]?.["Best qualities 3"]?.multipleChoice
  )
  addToList(
    qualitiesList,
    profileSummary?.["My Best Qualities"]?.["Best qualities 4"]?.multipleChoice
  )
  bottomBoxX = base.x
  drawBox(
    doc,
    base,
    { w: bottomBoxWidth, h: bottomBoxHeight },
    { layout: "x", padding: paddings.lg, borderRadius: 0.3 }
  )
  addImage(doc, QualitiesIcon, bottomBoxX + 0.3, bottomBoxY + 0.3, 0.4, 0.4)
  doc.setFontSize(fontSizes.subtitle)
  doc.text("Qualities", bottomBoxX + paddings.md + 0.5, bottomBoxY + paddings.md, {
    align: "left",
    baseline: "top",
  })
  doc.setFontSize(fontSizes.small)
  doc.text(
    qualitiesList.map(v => "- " + v),
    bottomBoxX + paddings.md,
    bottomBoxY + paddings.md + paddings.lg,
    {
      align: "left",
      baseline: "top",
      maxWidth: bottomBoxWidth - paddings.md * 2,
      lineHeightFactor: 1.5,
    }
  )

  return doc
}

export { generateCertificate, generateSummary }
