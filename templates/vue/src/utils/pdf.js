import { jsPDF } from "jspdf"
import moment from "moment"
import "./pdf.WorkSans.font"
import CertificateTemplate from "@/assets/certificate-template.png"
import SummaryBackground from "@/assets/summary-background.png"
import Helpers from "./Helpers"

// eslint-disable-next-line no-unused-vars
const generateCertificate = name => {
  // TODO: clean up code
  // TODO: determine user name (pass in as param)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "in",
    format: [13.02, 18.23],
  })

  const img = new Image()
  img.src = Helpers.getImagePath(CertificateTemplate)
  doc.addImage(img, "PNG", 0, 0, 18.23, 13.02)

  // doc.saveGraphicsState()
  // doc.setTextColor("#2f77cc")
  // doc.text("CERTIFICATE", 5.5, 3, { align: "center" })
  // doc.restoreGraphicsState()

  // doc.text("awarded to", 5.5, 3.5, { align: "center" })

  doc.setFont("WorkSans", "normal", "normal")
  doc.setFontSize(62)
  doc.text("Luke Skywalker", 18.23 / 2, 6.5, { align: "center" })

  // doc.setLineWidth(0.02)
  // doc.setDrawColor("#2f77cc")
  // doc.line(3, 4.4 + 0.2, 8, 4.4 + 0.2)

  // doc.setFontSize(18)
  // doc.text("for successful completion of the", 5.5, 5.4, { align: "center" })

  // doc.setFontSize(20)
  // doc.text("Transitioning Youth with Disabilities and Employment Program", 5.5, 6, { align: "center" })

  // doc.setFontSize(16)
  // doc.text("Date Issued", 6, 8, { align: "center" })
  // doc.text("Awarded By", 9, 8, { align: "center" })

  doc.setFontSize(28)
  const dateStr = moment().format("MMMM D, YYYY")
  doc.text(dateStr, 10.05, 11.05, { align: "center" })
  // doc.setFont("helvetica", "italic", "bold")
  // doc.text("Dr. Rachelle Hole", 9, 7.5, { align: "center" })

  // const dateStrWidth = Math.max(dateStr.length * 0.075, 0.8)
  // doc.line(6 - dateStrWidth, 7.5 + 0.2, 6 + dateStrWidth, 7.5 + 0.2)
  // doc.line(9 - 1.1, 7.5 + 0.2, 9 + 1.1, 7.5 + 0.2)

  return doc
}

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

const drawBox = (doc, base, boxSize, options = {}) => {
  const {
    fillColor = "#ffffff",
    layout = "y",
    padding = 0,
    text = null,
    fontSize = null,
    textAlign = null,
  } = options
  doc.setFillColor(fillColor)
  doc.rect(base.x, base.y, boxSize.w, boxSize.h, "F")
  if (text) {
    if (fontSize) {
      doc.setFontSize(fontSize)
    }
    doc.text(text, base.x + paddings.sm, base.y + boxSize.h / 2, {
      align: textAlign ?? "left",
      maxWidth: boxSize.w - paddings.sm * 2,
      baseline: "middle",
    })
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

// eslint-disable-next-line no-unused-vars
const generateSummary = (avatarImg, profileSummary) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [11.54, 16.14],
  })

  doc.setFont("WorkSans", "normal", "normal")

  const img = new Image()
  img.src = Helpers.getImagePath(SummaryBackground)
  doc.addImage(img, "PNG", 0, 0, 11.54, 16.14)

  doc.setFillColor("#ffffff")
  doc.rect(1, 1, 5.8, 2, "F")
  // doc.lines([[6, 0], [0, 2], [-6, 0], [0, -2]], 1, 1, [1, 1], "F")

  doc.setFontSize(fontSizes.title)
  doc.text("Luke Skywalker", 3, 1.85, { align: "left" })
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
    { w: boxSizes.lg.w, h: choicesBoxHeight }
  )
  doc.setFontSize(fontSizes.subtitle)
  doc.text("Choices", 7.8 + paddings.sm, choicesBeginY + paddings.sm, {
    align: "left",
    baseline: "top",
  })
  doc.setFontSize(fontSizes.small)
  doc.text(
    choicesList,
    7.8 + paddings.sm,
    choicesBeginY + paddings.sm + paddings.lg,
    {
      align: "left",
      baseline: "top",
      maxWidth: boxSizes.lg.w - paddings.sm * 2,
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
    { layout: "x", padding: paddings.lg }
  )
  doc.setFontSize(fontSizes.subtitle)
  doc.text("Skills", bottomBoxX + paddings.md, bottomBoxY + paddings.md, {
    align: "left",
    baseline: "top",
  })
  doc.setFontSize(fontSizes.small)
  doc.text(
    skillsList,
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
    { layout: "x", padding: paddings.lg }
  )
  doc.setFontSize(fontSizes.subtitle)
  doc.text("Preferences", bottomBoxX + paddings.md, bottomBoxY + paddings.md, {
    align: "left",
    baseline: "top",
  })
  doc.setFontSize(fontSizes.small)
  doc.text(
    preferencesList,
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
    { layout: "x", padding: paddings.lg }
  )
  doc.setFontSize(fontSizes.subtitle)
  doc.text("Qualities", bottomBoxX + paddings.md, bottomBoxY + paddings.md, {
    align: "left",
    baseline: "top",
  })
  doc.setFontSize(fontSizes.small)
  doc.text(
    qualitiesList,
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
