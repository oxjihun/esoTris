# esoTris

- 제작 배경

원조 테트리스에서는 정사각형 4개로 된 조각을 떨어뜨린다. 

"이 '4'를 다른 숫자로 바꾸면 어떨가?"라는 생각이 들었다. 

정사각형 5개로 된 조각을 떨어뜨리는 테트리스는 존재한다. 

그러나, 정사각형 3개로 된 조각을 떨어뜨리는 테트리스는 본 적이 없었다. 

정사각형 3개로 된 조각이 한 종류 뿐이므로 재미있는 게임을 만들 수 없기 때문에 그런 테트리스도 없는 것 같았다. 

하지만, 대각선으로 만나고 떨어지는 것도 허용하면 5가지로 조각의 수를 늘릴 수 있다. 

이 "트리오미노 테트리스"도 재미있겠다고 생각했고 완성에 도전하게 되었다. 

- 게임 방법

"Z", "X": 조각을 각각 왼쪽, 오른쪽으로 90˚ 회전시킨다. 

"I": 조각을 수직으로 빠르게 떨어뜨린다. 

"J", "L", "K": 조각을 각각 왼쪽, 오른쪽, 아래로 한 칸 이동시킨다. 

"N", ".": 조각을 각각 왼쪽 아래, 오른쪽 아래 대각선 방향으로 이동시킨다. 

- 프로젝트 목표

추후 다른 게임 제작에도 유용하게 쓸 수 있도록, 

Canvas API 사용법을 익힌다. 

HTML + Javascript에서 키보드 입력을 이용하는 방법을 익힌다. 

- 아이디어 출처

블록 디자인: 

(가운데) 회전축이 되는 블록이라 원을 사용했다. 깃헙 아이디의 이니셜이 알파벳 o로 시작하는 것도 고려했다. 

(가장자리) 회전하는 블록이다 보니, 바깥쪽으로 나아가는 화살표를 쓰면 어울릴 것 같았다. 

favicon_old: 

원래는 원 안에 블록을 비추는 식으로 제작하려 했으나, 블록을 네 개 붙인 것이 괜찮아 보여서 그대로 쓰게 되었다. 어디서 많이 본 디자인 같으므로 기억나면 수정할 것이다. 

→ favicon을 바꿔서 더 이상 해당하지 않는다. 

회전 방식: 

원래는 45도 회전이었지만 게임의 난이도를 위해 90도 회전으로 바꿨다. 

기타: 

첫 조각이 화면 위쪽이 아니라 가운데에서 시작하도록 한 것은 "테트리스" iOS 앱의 영향을 받았다. 

줄이 없어질 자리, 조각이 떨어질 자리는 대부분의 테트리스 게임에서 표시한다. 하지만 중괄호, 삼각형 표시는 직접 생각해냈다. 

낮/밤 모드 전환 버튼에 해/달을 사용하는 것은 독창적인 아이디어가 아니다. 디자인은 테트리스 조각에서 따온 것이다. 

어떤 조각이 나올지 미리 보여주는 기능은 대부분의 테트리스 게임에 있다고 생각하여 추가하였다. 