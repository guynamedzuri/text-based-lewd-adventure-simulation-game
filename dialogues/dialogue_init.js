window.tutorial = [
    {
        label: "firstLine",
        steps: [
            { text: "당신은 마을에 도착했습니다.", action: null },
            { text: "마을은 조용하고 평화로워 보입니다.", action: null }
        ],
        allowedCommands: [1, 2], // 허용된 명령어
    },
    {
        label: "talkToVillager",
        steps: [
            { text: "마을 주민에게 말을 걸었습니다.", action: null },
            { text: "주민은 당신을 반갑게 맞이합니다.", action: () => updateImage(characterImage, 'chara/wolf_smile.png') }
        ],
        destination: { dialogue: "tutorial", label: "firstLine" }, // 다음 대화로 이동
    }
];