package constructs

import play.api.libs.json.{Json, Writes}
import reactivemongo.bson.{BSONDocument, BSONDocumentReader, BSONDocumentWriter, BSONHandler, Macros}

class Hub(name: String, location: String, startTime: Long, endTime: Long, connectedUsers: Vector[User], subject: Subject, range: Int) {
  def durationHours(): Double = {
    (endTime - startTime).asInstanceOf[Double] / 3600000
  }

  def durationMillis(): Long = {
    endTime - startTime
  }
}

object Hub{

    implicit val hubHandler: BSONDocumentReader[Hub] with BSONDocumentWriter[Hub] with BSONHandler[BSONDocument, Hub] = Macros.handler[Hub]

    implicit val hubWriter: Writes[Hub] = Json.writes[Hub]

}
