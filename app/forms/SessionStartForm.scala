package forms

import play.api.data.Form
import play.api.data.Forms._

case class SessionStartForm(username: String, password: String, subject: String)

object SessionStartForm {

  val startForm: Form[SessionStartForm] = Form(
    mapping(
      "username" -> nonEmptyText,
      "password" -> nonEmptyText,
      "subject" -> nonEmptyText
    )(SessionStartForm.apply)(SessionStartForm.unapply)
  )
}