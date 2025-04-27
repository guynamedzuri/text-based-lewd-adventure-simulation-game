// keyword의 경우 해당 캐릭터와 관련된 리소스명을 찾기 쉽게하기 위한 키워드이다.
// 예를 들어 wolf_normal.png를 찾기 위해 `${charaInfo[1].keyword}_normal.png`와 같이 문자열을 만들어 사용해도 좋다.

const charaInfo = {
    1 : {
        name : "라니아",
        keyword : "wolf",
        love : 0,
        currentLocation : 2, // 현재 위치 (맵 ID)
    }
}