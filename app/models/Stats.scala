package models

import java.time
import java.time.{ZonedDateTime, LocalTime, Period, ZoneId}
import java.time.temporal.{TemporalField, ChronoUnit}

import reactivemongo.bson._

import java.util.Date

import scala.collection.mutable

// How to organize? One object, or a class for each stat?
// TODO: Optimize and combine the update functions to reduce repeated computation
// TODO: Idea: language for specifying partial results of a computation (every intermediate value should be accessible)
object Stats {

  // The list of available stats
  val stats: Map[String, Seq[Session] => BSONValue] = Map(
    "introMessage" -> introMessage,
    "subjectTotalsGoogle" -> subjectTotalsGoogle,
    "cumulativeGoogle" -> cumulativeGoogle,
    "averageSessionGoogle" -> averageSessionGoogle,
    "subjectCumulativeGoogle" -> subjectCumulativeGoogle,
    "testGroupDays" -> testGroupDays,
    "probabilityGoogle" -> probabilityGoogle(100),
    "todaysSessionsGoogle" -> todaysSessionsGoogle
  )


  def total(sessions: Seq[Session]): Double = {
    sessions.foldLeft(0L)((total: Long, session: Session) => {
      total + (session.endTime.getTime - session.startTime.getTime)
    }).toDouble / (3600 * 1000)
  }

  def totalBSON(sessions: Seq[Session]): BSONDouble = {
    BSONDouble(total(sessions))
  }

  def introMessage(sessions: Seq[Session]): BSONDocument = {

    val zone = ZoneId.of("America/Chicago")

    val totalHours = total(sessions)

    val dailyAverage = totalHours / daysSinceStart(zone)(sessions)

    val startZDT = startDate(zone)(sessions)

    val streaks = currentAndLongestStreaks(sessions)

    BSONDocument(
      "total" -> BSONDouble(totalHours),
      "start" -> BSONArray(BSONInteger(startZDT.getMonthValue), BSONInteger(startZDT.getDayOfMonth), BSONInteger(startZDT.getYear)),
      "dailyAverage" -> BSONDouble(dailyAverage),
      "currentStreak" -> BSONInteger(streaks._1),
      "longestStreak" -> BSONInteger(streaks._2),
      "daysSinceStart" -> BSONInteger(daysSinceStart(zone)(sessions).toInt)
    )
  }

  // TODO: Return the corresponding dates as well
  def currentAndLongestStreaks(sessions: Seq[Session]): (Int, Int) = {

    val zone = ZoneId.of("America/Chicago")

    var longest: Int = 0
    var current: Int = 0

    for (dailyTotal <- dailyTotals(zone)(sessions)) {
      if (dailyTotal != 0.0) {
        current += 1
      } else {

        // Check if we have a new longest streak
        if (current > longest) {
          longest = current
        }

        // Reset the current streak counter
        current = 0
      }
    }

    // Check the last (current) streak
    if (current > longest) {
      longest = current
    }

    (current, longest)
  }

  def longestOffStreak(sessions: Seq[Session]): BSONInteger = {

    ???
  }


  // For the applicable stats, have such a function
  def updatedTotal(oldTotal: BSONDouble, newSession: Session): BSONDouble = {
    BSONDouble(oldTotal.value + (newSession.endTime.getTime - newSession.startTime.getTime).toDouble / (3600 * 1000))
  }


  def subjectTotals(sessions: Seq[Session]): Vector[(String, Double)] = {

    val kv = sessions.foldLeft(Map[String, Long]())((totals, session) => {

      val previous = totals.getOrElse(session.subject, 0L)

      totals.updated(session.subject, previous + (session.endTime.getTime - session.startTime.getTime))
    }).toVector.sortBy(pair => -pair._2).map(pair => (pair._1, pair._2.toDouble / (3600 * 1000)))

    kv
  }

  def subjectTotalsGoogle(sessions: Seq[Session]): BSONDocument = {

    val totals = subjectTotals(sessions)

    BSONDocument(
      "columns" -> BSONArray(
        BSONArray(BSONString("string"), BSONString("Subject")),
        BSONArray(BSONString("number"), BSONString("Total Hours"))
      ),
      "rows" -> BSONArray(totals.map(p => BSONArray(BSONString(p._1), BSONDouble(p._2))))
    )
  }

  def cumulative(sessions: Seq[Session]): Seq[(Date, Double)] = {

    // Use seconds since epoch for marks?
    val marks = (for (year <- 115 until 116; month <- 0 until 12) yield new Date(year, month, 1)) ++ Seq(new Date(116, 0, 1), new Date(116, 1, 1))

    val cumulatives = groupSessions(sessions, marks).map(
      sessionGroup => sessionGroup.map(sess => sess.endTime.getTime - sess.startTime.getTime).sum.toDouble / (3600 * 1000)
    ).foldLeft((0.0, Seq[Double]()))((acc, next) => (acc._1 + next, acc._2 :+ (acc._1 + next)))._2

    marks.:+(new Date()).zip(cumulatives)
  }

  def cumulativeGoogle(sessions: Seq[Session]): BSONDocument = {

    val cumulatives = cumulative(sessions)

    BSONDocument(
      "columns" -> BSONArray(
        BSONArray(BSONString("date"), BSONString("Date")),
        BSONArray(BSONString("number"), BSONString("Cumulative Hours"))
      ),
      "rows" -> BSONArray(cumulatives.map(p => BSONArray(BSONLong(p._1.getTime), BSONDouble(p._2))))
    )
  }

  def averageSession(sessions: Seq[Session]): Vector[(String, Double)] = {

    val subTotals = mutable.Map[String, (Long, Long)]()

    for (session <- sessions) {

      val prev = subTotals.getOrElse(session.subject, (0L, 0L))

      subTotals(session.subject) = (prev._1 + (session.endTime.getTime - session.startTime.getTime), prev._2 + 1)
    }

    subTotals.iterator.map(pair => (pair._1, pair._2._1.toDouble / (pair._2._2 * 3600 * 1000))).toVector.sortBy(pair => -pair._2)
  }

  def averageSessionGoogle(sessions: Seq[Session]): BSONDocument = {

    val subTotals = averageSession(sessions)

    BSONDocument(
      "columns" -> BSONArray(
        BSONArray(BSONString("string"), BSONString("Subject")),
        BSONArray(BSONString("number"), BSONString("Average Session Length"))
      ),
      "rows" -> BSONArray(subTotals.map(p => BSONArray(BSONString(p._1), BSONDouble(p._2))))
    )
  }

  def subjectCumulative(sessions: Seq[Session]): (Seq[Date], Map[String, Seq[Double]]) = {

    val marks = (for (year <- 115 until 116; month <- 0 until 12) yield new Date(year, month, 1)) ++ Seq(new Date(116, 0, 1), new Date(116, 1, 1))

    val step1: Map[String, Seq[Session]] = sessions.foldLeft(Map[String, Seq[Session]]())((acc, s) =>
      acc.updated(s.subject, acc.getOrElse(s.subject, Seq[Session]()) :+ s)
    )

    val step2: Map[String, Seq[Seq[Session]]] = step1.mapValues(subSessions => groupSessions(subSessions, marks))

    val step3: Map[String, Seq[Double]] = step2.mapValues(
      vec => vec.map(sessionGroup => sessionGroup.map(sess => sess.endTime.getTime - sess.startTime.getTime).sum.toDouble / (3600 * 1000))
    )

    // Cumulate the values. We drop the first (zero) element due to the way scanLeft works
    val step4: Map[String, Seq[Double]] = step3.mapValues(_.scanLeft(0.0)(_ + _).drop(1))

    (marks :+ new Date(), step4)
  }

  def subjectCumulativeGoogle(sessions: Seq[Session]): BSONDocument = {

    val subjectCumulatives = subjectCumulative(sessions)

    val dates: Seq[Date] = subjectCumulatives._1

    val subjects = subjectCumulatives._2.keys.toSeq

    BSONDocument(
      "columns" -> BSONArray(
        BSONArray(BSONString("date"), BSONString("Date")) +: subjects.map(sub => BSONArray(BSONString("number"), BSONString(sub)))
      ),
      "rows" -> dates.indices.map(i => BSONArray(BSONLong(dates(i).getTime) +: subjects.map(sub => BSONDouble(subjectCumulatives._2(sub)(i)))))
    )
  }


  // Split up a sessions list using a list of dates.
  def groupSessions(sessions: Seq[Session], marks: Iterable[Date]): Seq[Seq[Session]] = {

    val groups = marks.foldLeft(sessions, Seq[Seq[Session]]())((acc, next) => {

      val sp = acc._1.span(_.endTime.before(next))

      val rem = sp._2.headOption.fold((None: Option[Session], None: Option[Session]))(sess => {
        if (sess.startTime.before(next)) {
          (Some(Session(sess.startTime, next, sess.subject)), Some(Session(next, sess.endTime, sess.subject)))
        } else {
          (None, Some(sess))
        }
      })

      // The drop(1) is here so that we don't duplicate the head element
      (rem._2 ++: sp._2.drop(1), acc._2 :+ (sp._1 ++ rem._1))
    })

    // Should we append that last group or not?
    groups._2 :+ groups._1
  }

  /**
    *
    *
    * Assumes that the sessions are in order
    *
    * @param sessions
    * @return
    */
  def groupDays(zone: ZoneId)(sessions: Seq[Session]): (Seq[(Date, Date)], Seq[Seq[Session]]) = {

    // TODO: Ues ZonedDateTimes instead of dates
    // TODO: Generalize this to accept a temporal unit
    // TODO: Make it an iterator

    // Epoch second to instant
    val startInstant = sessions.head.startTime.toInstant

    // Should use the current instant, not the last session
    val endInstant = time.Instant.now()

    // Instant to zoned datetime in default zone
    val startZDT = time.ZonedDateTime.ofInstant(startInstant, zone)

    val endZDT = time.ZonedDateTime.ofInstant(endInstant, zone)

    // Get end of first day
    val startDayZDT = startZDT.truncatedTo(ChronoUnit.DAYS).plusDays(1)

    // Get start of last day
    val endDayZDT = endZDT.truncatedTo(ChronoUnit.DAYS)

    val diff = startDayZDT.until(endDayZDT, ChronoUnit.DAYS)

    val dayMarks = for (i <- 0L to diff) yield startDayZDT.plusDays(i).toEpochSecond

    val bounds = for (i <- 0L to diff) yield (
      new Date(startDayZDT.plusDays(i - 1).toInstant.toEpochMilli),
      new Date(startDayZDT.plusDays(i).toInstant.toEpochMilli)
      )

    val dates = dayMarks.map(t => new Date(t * 1000))

    (bounds :+(new Date(endDayZDT.toInstant.toEpochMilli), new Date(endInstant.toEpochMilli)), groupSessions(sessions, dates))
  }

  def testGroupDays(sessions: Seq[Session]): BSONDocument = {

    val (bounds, sessionGroups) = groupDays(ZoneId.of("America/Chicago"))(sessions)

    val groupTotals = sessionGroups.map(sessionGroup => sessionGroup.map(session => session.endTime.getTime - session.startTime.getTime).sum)

    BSONDocument(
      "dates" -> bounds.map(bound => BSONArray(bound._1, bound._2)),
      "values" -> BSONArray(groupTotals.map(total => BSONLong(total)))
    )
  }

  def sumSessions(sessions: Seq[Session]): Double = {
    sessions.foldLeft(0L)((total: Long, session: Session) => {
      total + (session.endTime.getTime - session.startTime.getTime)
    }).toDouble / (3600 * 1000)
  }

  def dailyTotals(zone: ZoneId)(sessions: Seq[Session]): Seq[Double] = {

    groupDays(zone)(sessions)._2.map(s => sumSessions(s))
  }

  def startDate(zone: ZoneId)(sessions: Seq[Session]): ZonedDateTime = {

    // TODO: check for empty lists
    val startInstant = sessions.head.startTime.toInstant

    val startZDT = time.ZonedDateTime.ofInstant(startInstant, zone)

    startZDT
  }

  def daysSinceStart(zone: ZoneId)(sessions: Seq[Session]): Long = {

    val now = ZonedDateTime.now(zone)

    // We include the current day, hence the + 1
    startDate(zone)(sessions).until(now, ChronoUnit.DAYS) + 1
  }

  def todaysSessions(zone: ZoneId)(sessions: Vector[Session]): Vector[Session] = {

    val startOfToday = ZonedDateTime.now(zone).truncatedTo(ChronoUnit.DAYS).toEpochSecond

    // Call reverse to get sessions in chronological order
    sessions.reverseIterator.takeWhile(s => s.startTime.toInstant.getEpochSecond >= startOfToday).toVector.reverse
  }

  def todaysSessionsGoogle(sessions: Seq[Session]): BSONDocument = {

    BSONDocument(
      "columns" -> BSONArray(
        BSONArray(BSONString("string"), BSONString("Subject")),
        BSONArray(BSONString("number"), BSONString("Start")),
        BSONArray(BSONString("number"), BSONString("Finish"))
      ),
      "rows" -> BSONArray(todaysSessions(ZoneId.of("America/Chicago"))(sessions.toVector).map(s => BSONArray(BSONString(s.subject), BSONLong(s.startTime.getTime), BSONLong(s.endTime.getTime))))
    )

  }

  def probability(numBins: Int)(sessions: Seq[Session]): Seq[(LocalTime, Double)] = {

    val bins = Array.fill[Double](numBins)(0)

    val (groupBounds, dayGroups) = groupDays(ZoneId.of("America/Chicago"))(sessions)

    for ((bounds, group) <- groupBounds.zip(dayGroups)) {

      for (session <- group) {

        val diff = bounds._2.toInstant.getEpochSecond - bounds._1.toInstant.getEpochSecond

        val startBin: Int = (((session.startTime.toInstant.getEpochSecond - bounds._1.toInstant.getEpochSecond).toDouble / diff) * numBins).toInt

        val endBin: Int = (((session.endTime.toInstant.getEpochSecond - bounds._1.toInstant.getEpochSecond).toDouble / diff) * numBins).toInt

        // Currently excluding the end bin
        for (bin <- startBin until endBin) {
          bins(bin) += 1
        }
      }
    }

    // Currently, the groups are in UTC, so days start at 6:00:00
    val zero = LocalTime.of(6, 0, 0)

    val stepSeconds: Long = (86400.0 / numBins).toLong

    val binTimes = for (i <- 0 until numBins) yield zero.plusSeconds(i * stepSeconds + stepSeconds / 2)

    // Normalize by number of days
    val (front, back) = binTimes.zip(bins.map(_ / dayGroups.length)).span(p => p._1.getHour >= 6)

    // Rearrange so that google charts displays them correctly
    back ++ front
  }

  def probabilityGoogle(numBins: Int)(sessions: Seq[Session]): BSONDocument = {

    val probs = probability(numBins)(sessions)


    BSONDocument(
      "columns" -> BSONArray(
        BSONArray(BSONString("timeofday"), BSONString("Time of Day")),
        BSONArray(BSONString("number"), BSONString("Probability"))
      ),
      "rows" -> BSONArray(probs.map(p => BSONArray(BSONArray(p._1.getHour, p._1.getMinute, p._1.getSecond), BSONDouble(p._2)))),
      "options" -> BSONDocument(
        "chart" -> BSONDocument(
          "title" -> "Probability That I'm Programming"
        ),
        "legend" -> BSONDocument(
          "position" -> "none"
        ),
        "colors" -> BSONArray("green"),
        "dataOpacity" -> 0.25
      )
    )
  }


  // Function that will update all (or one?) statistics
  def update(user_id: Int): Unit = {

    // 1. Get user sessions
    // 2. stats.mapValues() with sessions
    // 3. Create BSONDocument for updating user stats
    ???
  }

}
