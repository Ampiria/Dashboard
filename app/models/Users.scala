package models

// Standard Library
import constructs._

import scala.concurrent.Future
import scala.util.Random

// Play Framework
import play.api.libs.concurrent.Execution.Implicits.defaultContext

// Reactive Mongo
import play.modules.reactivemongo.ReactiveMongoApi
import reactivemongo.api.collections.bson.BSONCollection
import reactivemongo.bson.BSONDocument

// Project
import constructs.User
import constructs.responses.{AboutMessage, Credentials, ProfilesOnly}
import helpers.Selectors.{emailSelector, usernameSelector}


/**
  * Model layer to manage users
  *
  * @param api Holds the reference to the database.
  */
class Users(protected val api: ReactiveMongoApi) {

  // The users collection
  protected def usersCollection: BSONCollection = api.db.collection[BSONCollection]("users")


  /**
    * Add a new user to the database.
    *
    * @param newUser The user being added.
    * @return
    */
  def addNewUser(newUser: User): Future[Boolean] = {

    usersCollection.insert(newUser).map(result => {
      result.ok
    })

  }


  /**
    * Get the about message for the user.
    *
    * @param username The username for which to retrieve the data.
    * @return
    */
  def aboutMessage(username: String): Future[Option[AboutMessage]] = {

    usersCollection.find(usernameSelector(username), AboutMessage.projector).one[AboutMessage]
  }


  /**
    * Get the social profiles for the user.
    *
    * @param username The username for which to retrieve data.
    * @return
    */
  def socialProfiles(username: String): Future[Option[ProfilesOnly]] = {

    usersCollection.find(usernameSelector(username), ProfilesOnly.projector).one[ProfilesOnly]
  }


  /**
    * Return true iff the username is already in the database.
    *
    * @param username The username to check for.
    * @return
    */
  def usernameInUse(username: String): Future[Boolean] = {

    usersCollection.count(Some(usernameSelector(username)), limit = 1).map(count => count != 0)
  }


  /**
    * Return true if the email is already in the database.
    *
    * @param email The email address to check for.
    * @return
    */
  def emailInUse(email: String): Future[Boolean] = {

    usersCollection.count(Some(emailSelector(email)), limit = 1).map(count => count != 0)
  }


  /**
    * Check a string against a user's password
    *
    * @param username The username for which to check the password.
    * @param given    The string to check against the user's actual password.
    * @return
    */
  def checkCredentials(username: String, given: String): Future[Boolean] = {

    usersCollection.find(usernameSelector(username), Credentials.projector).one[Credentials].map(optCredentials =>

      optCredentials.fold(false)(credentials => credentials.password == given)
    )
  }


  /**
    * Retrieve the user with the given username
    *
    * @param username The username in question
    * @return
    */
  def getUserByUsername(username: String): Future[Option[User]] = {
    usersCollection.find(usernameSelector(username), User.projector).one[User]
  }


  /**
    * Search for a particular username
    *
    * @param query The search text
    * @param limit The maximum number of results to return
    * @return
    */
  def searchUsername(query: String, limit: Int = Int.MaxValue): Future[List[User]] = {

    // ALl usernames which contain the query
    val selector = BSONDocument("username" -> BSONDocument("$regex" -> query))

    usersCollection.find(selector).cursor[User]().collect[List](upTo = limit)
  }


  /**
    * Find a user by their actual name
    *
    * @param name
    * @return
    */
  def findByName(name: String): Future[Option[Int]] = {
    ???
  }

  /**
    *Adds 1000 random users with varying session amounts for demo purposes
    */
  protected def bsonSessionsCollection: BSONCollection = api.db.collection[BSONCollection]("sessions")
  def addRandomUsers(): Unit ={
    var usr = 0
    val rand: Random = new Random()
    for (usr <- 0 to 1000){
      val randJoined: Long = rand.nextInt(15552000) + 1451624401
      val user: User = new User(rand.nextString(20),
        "Example about message",
        new ContactInfo("John", "Doe", "Francis",
          rand.nextString(8) + "@gmail.com", "555-555-5555",
          new Profiles("", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "")),
        "password", randJoined,
        new Status(rand.nextBoolean(), "webdev", randJoined - rand.nextInt(7200)),
        Vector(Subject("webdev", randJoined, "Anything related to web development"), Subject("scala", randJoined, "scala development"),
          Subject("python", randJoined, "python development")))
      addNewUser(user)
      val randSessionNumber = rand.nextInt(9996) + 5
      var sess = 0
      val num = 1490846399 - randJoined
      val randSessStart = rand.nextInt(num.asInstanceOf[Int]) + randJoined
      val randSessStop = randSessStart + rand.nextInt(18001 - 1200) + 1200
      for (sess <- 0 to randSessionNumber){
        val newSession: Session = Session(user.subjects.apply(rand.nextInt(user.subjects.length)).name, randSessStart, randSessStop, "Example session Message")
        val selector = usernameSelector(user.username)
        val modifier = BSONDocument(
          "$push" -> BSONDocument(
            "sessions" -> newSession
          )
        )
        bsonSessionsCollection.update(selector, modifier, multi = false).map(result =>
          if (result.ok) ResultInfo.succeedWithMessage("Finished studying")
          else ResultInfo.failWithMessage(result.errmsg.getOrElse(ResultInfo.noErrMsg)))
      }
    }
  }
}

