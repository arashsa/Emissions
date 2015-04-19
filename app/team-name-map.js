const teamMap = Object.freeze({
    'commander': 'operasjonsleder',
    'science': 'forskningsteam',
    'communication': 'kommunikasjonsteam',
    'security': 'sikkerhetsteam',
    'astronaut': 'astronautteam'
});

function otherTeamNames(currentTeamId) {
    return Object.keys(teamMap)
        .filter((n) => n !== currentTeamId && n !== 'leader')
        .map((n) => teamMap[n])
        .join(', ')
}

module.exports = {
    nameMap: teamMap,
    otherTeamNames
};
