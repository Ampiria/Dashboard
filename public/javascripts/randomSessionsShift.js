function randomSessionShift(sessions){
    var modifiedSessions = [];
    for each(var session in sessions){
        var shift = Math.random >= 0.5;
        if(shift){
            modifiedSessions.push(shift(Math.random(), session));
        }else{
            modifiedSessions.push(scale(Math.random(), session));
        }
    }

    return sessions;
}

function shift(intensity, session){
    var shiftLeft = Math.random() >= 0.5;
    var randomShift = Math.floor(Math.floor(Math.random() * (session["stoptime"] - session["starttime"])/2) * intensity);

    if(shiftLeft){
        session["starttime"] -= randomShift;
        session["stoptime"] -= randomShift;
    }else{
        session["starttime"] += randomShift;
        session["stoptime"] += randomShift;
    }

    return session;
}

function scale(intensity, session){
    var grow = Math.random() >= 0.5;
    var randomScale = Math.floor(Math.floor(Math.random() * (session["stoptime"] - session["starttime"])/4) * intensity);

    if(grow){
        session["starttime"] -= randomScale;
        session["stoptime"] += randomScale;
    }else{
        session["starttime"] += randomScale;
        session["stoptime"] -= randomScale;
    }

    return session;
}