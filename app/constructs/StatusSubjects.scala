package constructs

/**
  * Used when both the user's status and subject list are needed.
  *
  * @param user_id  The user's id.
  * @param status   The status of the user.
  * @param subjects The valid subjects for the user
  */
case class StatusSubjects(user_id: Int, status: Status, subjects: Vector[Subject])


object StatusSubjects {

  import reactivemongo.bson.Macros

  // Implicitly converts to/from BSON
  implicit val StatusDataHandler = Macros.handler[StatusSubjects]


}