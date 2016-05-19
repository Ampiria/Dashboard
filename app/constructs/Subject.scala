package constructs


/**
  * Represents a subject that can be studied.
  *
  * TODO: Remove the isLanguage field
  *
  * @param name        The name of the subject.
  * @param added       The time when the subject was added.
  * @param isLanguage  Whether this subject a programming language.
  * @param description A description of this subject.
  */
case class Subject(name: String, added: Long, isLanguage: Boolean, description: String)

object Subject {

  import reactivemongo.bson.Macros

  // Implicitly converts to/from BSON
  implicit val SubjectHandler = Macros.handler[Subject]


}