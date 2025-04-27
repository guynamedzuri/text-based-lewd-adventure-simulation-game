//각 맵의 commands에는 commandMap에서 정의한 명령어의 key를 입력해 해당 맵에서 수행할 수 있는 명령을 추가할 것.
const maps = {
    1 : {
        name : "나의 집",
        description : "이곳은 당신의 집입니다. 편안한 공간입니다.",
        connectedMaps : [2, 3],
        commands : []
    },
    2 : {
        name : "목장",
        description : "당신의 소중한 소가 있는 곳입니다. 이곳에서 우유를 채집할 수 있습니다.",
        connectedMaps : [1, 3],
        commands : []
    },
    3 : {
        name : "마을",
        description : "평화로운 마을입니다. 상점과 술집이 있습니다.",
        connectedMaps : [1, 2],
        commands : []
    }
}