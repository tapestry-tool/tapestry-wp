import { jsPDF } from "jspdf"
import moment from "moment"
import "./pdf.WorkSans.font"
import CertificateTemplate from "@/assets/certificate-template.png"
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

  // console.log(doc.getFontList())

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

export { generateCertificate }
