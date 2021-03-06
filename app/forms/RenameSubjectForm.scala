package forms

import play.api.data.Form
import play.api.data.Forms._


case class RenameSubjectForm(username: String, password: String, oldName: String, newName: String)

object RenameSubjectForm {

  val form: Form[RenameSubjectForm] = Form(
    mapping(
      "username" -> nonEmptyText,
      "password" -> nonEmptyText,
      "oldName" -> nonEmptyText,
      "newName" -> nonEmptyText
    )(RenameSubjectForm.apply)(RenameSubjectForm.unapply)
  )
}
