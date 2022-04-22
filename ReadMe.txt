Nodejs service register

1. https://github.com/diorcokorea/yeonsei_nodejs에서 git clone을 수행 한다.
2. https://nodejs.org/ko/download/에서 최신의 Windows Installer(64-bit)를 다운로드후 설치 한다.
3. 1번에서 만든 폴더로 이동후 npm install을 수행한다.
4. 1번에서 만든 폴더로 이동후 install_service.bat을 수행한다.(실행시 관리자 권한을 요구함 반드시 "YES"해야 한다.)
5, 작업관리자->서비스 탭에서 이름이 “ai-middleware” 존재 하는지 확인후 상태가 “실행중＂으로 표시 되는지 확인한다.
6. 크롬에서 “http://localhost:8080으로 실행후 웹페이지가 정상적으로 표시 되는지 확인한다.(ERR_CONNECTION_REFUSED가 표시 되면 실패)
7. PC를 재부팅후 6번 작업 수행 후 정상인지 확인한다.
