function createScheduleBasedOnDailyStudyAmounts(user, goal){
    var schedule = [];
    var suggestedAverage = goal.totalStudyAmount/goal.numberOfDays;
    var today = new Date();
    var dayOfWeek = today.getDay();
    var totalAmountLeft = goal.totalAmount;
    var peakProbability = Math.max.apply(Math, user.probabilityStudying);

    for(var i = 0; i < goal.numberOfDays; i++){
        schedule.push(0);
    }

    for(var i = 0; i < goal.numberOfDays; i++){
        var todaysAverage = user.dayOfWeekAverages[dayOfWeek];
        if(suggestedAverage > todaysAverage){
            schedule[i] = todaysAverage;
            totalAmountLeft -= todaysAverage;
        } else{
            schedule[i] = suggestedAverage;
            totalAmountLeft -= suggestedAverage;
        }
    }

    if(totalAmountLeft > 0){
        for(var i = 0; i < schedule.length; i++){
            schedule[i] += totalAmountLeft / schedule.length;
        }
    }

    for(var i = 0; i < schedule.length; i++){
        for(var j = 0; j < user.probabilityStudying.length; j++){
            var time = schedule[i];
            if(user.probabilityStudying[j] == peakProbability){
                if(j - time/2 > 0){
                    if(j + time/2 < 24){
                        schedule[i] = [j - time/2, j + time/2];
                    }else{
                        schedule[i] = [j - (schedule[i] - (24 - j)),24];
                    }
                }else{
                    schedule[i]  = [0, j + (schedule[i] - j)];
                }
            }
        }
    }

    return schedule;
}