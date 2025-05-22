window.mainPhase = [{
    label: "init",
    steps: [{
        text: "아무거나",
        action: null
    }],
    allowedCommands: [
        1,
        2
    ]
}];

window.start = [{
        label: "initialize",
        steps: [{
            text: "",
            action: () => {
                const logWindow = document.getElementById('logWindow');
                if (logWindow) {
                    const img = document.createElement('img');
                    img.src = 'title.png'; // 메인 디렉토리의 title.png
                    img.alt = '타이틀 이미지';
                    img.style.width = '100%'; // 이미지 크기 조정
                    img.style.height = 'auto';
                    logWindow.appendChild(img);
                    logWindow.scrollTop = logWindow.scrollHeight; // 스크롤을 맨 아래로 이동
                }
                nextLine(); // 다음 줄로 이동
                return;
            }
        }],
        customCommands: [{
                text: "처음부터 시작한다",
                destination: {
                    dialogue: "start",
                    label: "skipAsk"
                }
            },
            {
                text: "이야기를 불러온다",
                destination: {
                    dialogue: "start",
                    label: "notReady"
                }
            }
        ]
    },
    {
        label: "skipAsk",
        steps: [{
            text: "인트로를 보시겠습니까?",
            action: null
        }],
        customCommands: [{
                text: "본다",
                destination: {
                    dialogue: "start",
                    label: "intro"
                }
            },
            {
                text: "스킵한다",
                destination: {
                    dialogue: "start",
                    label: "startPhase"
                }
            }
        ]
    },
    {
        label: "notReady",
        steps: [{
            text: "죄송합니다. 현재 세이브로드 기능 구현중입니다.",
            action: null
        }],
        destination: {
            dialogue: "start",
            label: "initialize"
        }
    },
    {
        label: "intro",
        steps: [{
                text: "",
                action: () => {
                    clearLogWindow();
                    nextLine();
                    return;
                }
            },
            {
                text: "인트로입니다.",
                action: null
            },
            {
                text: "대충 당신은 젖짜기 마스터고요.",
                action: null
            },
            {
                text: "당신은 억대의 빚을 젖짜기로 갚아나가야 합니다.",
                action: null
            },
            {
                text: "매주 갚아나가야하는 돈은 점점 늘어나게 되구요.",
                action: null
            },
            {
                text: "마지막까지 버틴다면 최소 노말엔딩.",
                action: null
            },
            {
                text: "그럼 화이팅.",
                action: null
            }
        ],
        destination: {
            dialogue: "start",
            label: "startPhase"
        }
    },
    {
        label: "startPhase",
        steps: [{
                text: "",
                action: () => {
                    clearLogWindow();
                    nextLine();
                    return;
                }
            },
            {
                text: "이곳은 시작페이즈.",
                action: null
            },
            {
                text: "체력이 0이 되거나 집에서 잠든다 명령을 입력하면 그날 하루는 종료되어 이곳으로 오게 됩니다.",
                action: null
            },
            {
                text: "여기서는 저장 및 불러오기를 할 수 있으며 현 상태를 점검할 수 있습니다.",
                action: null
            },
            {
                text: "즉, 이곳에서 벗어나시면 하루가 종료될 때까지 저장 및 불러오기는 하실 수 없습니다.",
                action: null
            },
            {
                text: "보통 이곳에선 이런식으로 메세지가 나오기보다는 현재 돈, 상환까지 남은 일 수",
                action: null
            },
            {
                text: "대충 이런 정보들을 한번에 출력하여 보여줄 것 같습니다.",
                action: null
            },
            {
                text: "그럼 이제 시작페이즈에서 할 수 있는 명령어들을 보여드리겠습니다.",
                action: null
            }
        ],
        allowedCommands: [
            100,
            101,
            102,
            103
        ]
    }
];

window.tutorial = [{
        label: "firstLine",
        steps: [{
                text: "당신은 마을에 도착했습니다.",
                action: null
            },
            {
                text: "마을은 조용하고 평화로워 보입니다.",
                action: null
            }
        ],
        allowedCommands: [
            1,
            2
        ]
    },
    {
        label: "talkToVillager",
        steps: [{
                text: "마을 주민에게 말을 걸었습니다.",
                action: null
            },
            {
                text: "주민은 당신을 반갑게 맞이합니다.",
                action: () => updateImage(characterImage, 'chara/wolf_smile.png')
            }
        ],
        destination: {
            dialogue: "tutorial",
            label: "firstLine"
        }
    },
    {
        label: "friendlyVillager",
        steps: [{
            text: "마을 주민이 당신에게 말을 겁니다.",
            action: null
        }],
        destination: function anonymous() {
            if (charaInfo[1].love > 10) {
                charaInfo[1].love += 5;
                return {
                    dialogue: "tutorial",
                    label: "talkToVillager"
                };
            } else if (charaInfo[1].love > 5) {
                charaInfo[1].love += 2;
                return {
                    dialogue: "tutorial",
                    label: "neutralResponse"
                };
            } else {
                charaInfo[1].love++;
                return {
                    dialogue: "tutorial",
                    label: "coldResponse"
                };
            }
        }
    },
    {
        label: "friendlyVillager",
        steps: [{
            text: "마을 주민이 당신에게 말을 겁니다.",
            action: null
        }],
        customCommands: [{
                text: "text1",
                destination: () => {
                    no = true;
                    return {
                        dialogue: "tutorial",
                        label: "question1-no"
                    };
                }
            },
            {
                text: "text2",
                destination: {
                    dialogue: "tutorial",
                    label: "question1-yes"
                }
            }
        ]
    },
    {
        label: "complexScenario",
        steps: [{
            text: "이것은 복잡한 시나리오입니다.",
            action: null
        }],
        customCommands: [{
                text: "선택지1",
                destination: {
                    dialogue: "tutorial",
                    label: "option1"
                }
            },
            {
                text: "선택지2",
                destination: () => {
                    console.log("선택지2를 선택했습니다.");
                    return {
                        dialogue: "tutorial",
                        label: "option2"
                    };
                }
            }
        ]
    },
    {
        label: "option1",
        steps: [{
            text: "당신은 첫 번째 선택지를 선택했습니다.",
            action: null
        }],
        destination: {
            dialogue: "tutorial",
            label: "complexScenario"
        }
    },
    {
        label: "option2",
        steps: [{
            text: "당신은 두 번째 선택지를 선택했습니다.",
            action: null
        }],
        destination: function anonymous() {
            if (player.stats.strength > 10) {
                return {
                    dialogue: "tutorial",
                    label: "strongPath"
                };
            } else {
                return {
                    dialogue: "tutorial",
                    label: "weakPath"
                };
            }
        }
    },
    {
        label: "strongPath",
        steps: [{
            text: "당신은 강한 길을 선택했습니다.",
            action: null
        }],
        allowedCommands: [
            5,
            6
        ]
    },
    {
        label: "weakPath",
        steps: [{
            text: "당신은 약한 길을 선택했습니다.",
            action: null
        }],
        allowedCommands: [
            7,
            8
        ]
    }
];