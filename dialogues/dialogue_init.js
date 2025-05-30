window.mainPhase = [
    {
        label: "init",
        steps: [
            {
                text: "아무거나",
                action: null
            }
        ],
        allowedCommands: [
            1,
            2
        ]
    }
];

window.start = [
    {
        label: "initialize",
        steps: [
            {
                text: "\n",
                action: () => {
        const logWindow = document.getElementById('logWindow');
        if (logWindow) {
            clearLogWindow(); // 로그 창 초기화
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
            }
        ],
        customCommands: [
            {
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
        steps: [
            {
                text: "인트로를 보시겠습니까?",
                action: null
            }
        ],
        customCommands: [
            {
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
        steps: [
            {
                text: "죄송합니다. 현재 세이브로드 기능 구현중입니다.",
                action: null
            }
        ],
        destination: {
            dialogue: "start",
            label: "initialize"
        }
    },
    {
        label: "intro",
        steps: [
            {
                text: "",
                action: () => {clearLogWindow(); nextLine(); return;}
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
        steps: [
            {
                text: "",
                action: () => {clearLogWindow(); nextLine(); return;}
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
                text: "원래는 더 다양한 명령어를 보여줘야하는 구간이지만 일단은 그냥 진행해주시기 바랍니다.",
                action: null
            }
        ],
        customCommands: [
            {
                text: "눈을 뜬다",
                destination: () => { clearLogWindow(); return {dialogue:"mainPhase", label:"init"} }
            }
        ]
    },
    {
        label: "move",
        steps: [
            {
                text: "어디로 이동하십니까?",
                action: null
            }
        ],
        customCommands: [
            {
                text: "목장",
                destination: {
                    dialogue: "start",
                    label: "moveToMap"
                }
            },
            {
                text: "마을",
                destination: {
                    dialogue: "start",
                    label: "moveToMap"
                }
            }
        ]
    },
    {
        label: "endParagraphForTest",
        steps: [
            {
                text: "테스트용",
                action: null
            }
        ],
        destination: {
            dialogue: "start",
            label: "initialize"
        }
    }
];