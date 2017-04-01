/*
* returns a list of the overlap between any number of users
*/
function studyTimesOverlap(users){
    var minimums = [];
    var userVals = [];
    for(var i = 0; i < users[0].probabilityStudying.length; i++){
        for each (var user in users){
            userVals.push(user.probabilityStudying[i]);
        }
        minimums.push(Math.min.apply(Math, userVals));
        userVals.length = 0;
    }
    return minimums;
}

/*
* returns the best user within a selected scope that matches a select users study habits
*/
function bestUserMatch(selectedUser, usersInScope){
    var bestUserMatchSum = 0;
    var subjectMatch;
    var bestUserMatch = "";

    if(selectedUser.sharingLocation){
        var locationMatch = locationOverlap(selectedUser.location, usersInScope);
        subjectMatch = subjectOverlap(selectedUser.studying, locationMatch);
    }else{
        subjectMatch = subjectOverlap(selectedUser.studying, usersInScope);
    }

    for each (var user in subjectMatch){
        var currentComparison = studyTimesOverlap([selectedUser, user]);
        var currentComparisonSum = 0;
        for each (var i in currentComparison){
            currentComparisonSum += i;
        }
        if(currentComparisonSum > bestUserMatchSum){
            bestUserMatch = user.username;
            bestUserMatchSum = currentComparisonSum;
        }
    }

    return bestUserMatch;
}

/*
*returns the peak time ranges between two users
*/
function peakTimeOverlap(user1, user2){
    var overlap = studyTimesOverlap([user1, user2]);
    var peakTimeRanges = [];
    var peakProbability = Math.max.apply(Math, Overlap);
    var minPeakProbability = peakProbability/2;
    var peakTimes = [];

    for(var i = 0; i < user1.time; i++){
        if(overlap[i] = minPeakProbability){
            peakTimes.push(user1.time[i]);
        }
    }

    if(peakTimes.length%2 == 0){
        for(var i = 0; i < peakTimes.length; i += 2){
            peakTimeRanges.push([peakTimes[i], peakTimes[i + 1]]);
        }
    }else{
        for(var i = 0; i < peakTimes.length - 1; i += 2){
            peakTimeRanges.push([peakTimes[i], peakTimes[i + 1]]);
        }
        peakTimeRanges.push(peakTimes[peakTimes.length], user1.time[user1.time.length]);
    }
    return peakTimeRanges;
}

/*
*returns a list of matched users based on subject correlation
*/
function subjectOverlap(subject, users){
    var matchedUsers = [];
    for each (var user in users){
        if(user.studying = subject){
            matchedUsers.push(user);
        }
    }
    return matchedUsers;
}

/*
* returns a list of matched users based on location correlation
*/
function locationOverlap(location, users){
    var matchedUsers = [];
    for each (var user in users){
        if(!user.sharingLocation){
            continue;
        }else{
            if(user.location == location){
                matchedUsers.push(user);
            }
        }
    }
    return matchedUsers;
}