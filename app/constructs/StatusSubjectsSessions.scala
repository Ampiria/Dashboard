package constructs

/**
  * Used when a user's status, subject vector, and session vector are needed.
  *
  * @param user_id  The user's ID.
  * @param status   The study status of the user.
  * @param subjects The subject vector for the user.
  * @param sessions The session list for the user.
  */
case class StatusSubjectsSessions(user_id: Int, status: Status, subjects: Vector[Subject], sessions: Vector[Session])


object StatusSubjectsSessions {

  import reactivemongo.bson.Macros

  // Implicitly converts to/from BSON
  implicit val SessionDataHandler = Macros.handler[StatusSubjectsSessions]

}