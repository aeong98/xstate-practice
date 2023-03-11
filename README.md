# 스테이트 패턴이란

> 상태 패턴(State Pattern) 을 사용하면 객체의 내부 상태가 바뀜에 따라서 객체의 행동을 바꿀 수 있다. 마치 객체의 클래스가 바뀌는 것과 같은 결과를 얻을 수 있다.
> 

# 상태  기계 기초


## 1. 상태들을 모아보기

총 4개의 상태 존재

- No Quarter : 동전 없음
- Has Quarter: 동전 있음
- Gumball Sold : 알맹이 판매
- Out of Gumballs : 알맹이 매진

## 2. 현재 상태를 저장하는 인스턴스 변수를 만들고 각 상태의 값을 정의

```java
final static int SOLD_OUT =0;
final static int NO_QUARTER = 1;
final static int HAS_QUARTER = 2;
final static int SOLD =3;
```

## 3.  이 시스템에서 일어날 수 있는 모든 행동을 모아보기

- 동전 투입
- 동전 반환
- 손잡이 돌림
- 알맹이 내보냄

## 4. 뽑기 기계 코드를 구현해보기

- 예시 코드
    
    ```java
    public class GumballMachine {
        final static int SOLD_OUT = 0;
        final static int NO_QUARTER = 1;
        final static int HAS_QUARTER = 2;
        final static int SOLD = 3;
    
        int state = SOLD_OUT;
        int count = 0;
    
        public GumballMachine(int count) {
            this.count = count;
            if (count > 0) {
                state = NO_QUARTER;
            }
        }
    
        public void insertQuarter() {
            if (state == HAS_QUARTER) {
                System.out.println("You can't insert another quarter");
            } else if (state == NO_QUARTER) {
                state = HAS_QUARTER;
                System.out.println("You inserted a quarter");
            } else if (state == SOLD_OUT) {
                System.out.println("You can't insert a quarter, the machine is sold out");
            } else if (state == SOLD) {
                System.out.println("Please wait, we're already giving you a gumball");
            }
        }
    
        public void ejectQuarter() {
            if (state == HAS_QUARTER) {
                System.out.println("Quarter returned");
                state = NO_QUARTER;
            } else if (state == NO_QUARTER) {
                System.out.println("You haven't inserted a quarter");
            } else if (state == SOLD) {
                System.out.println("Sorry, you already turned the crank");
            } else if (state == SOLD_OUT) {
                System.out.println("You can't eject, you haven't inserted a quarter yet");
            }
        }
    
        public void turnCrank() {
            if (state == SOLD) {
                System.out.println("Turning twice doesn't get you another gumball!");
            } else if (state == NO_QUARTER) {
                System.out.println("You turned but there's no quarter");
            } else if (state == SOLD_OUT) {
                System.out.println("You turned, but there are no gumballs");
            } else if (state == HAS_QUARTER) {
                System.out.println("You turned...");
                state = SOLD;
                dispense();
            }
        }
    
        private void dispense() {
            if (state == SOLD) {
                System.out.println("A gumball comes rolling out the slot");
                count = count - 1;
                if (count == 0) {
                    System.out.println("Oops, out of gumballs!");
                    state = SOLD_OUT;
                } else {
                    state = NO_QUARTER;
                }
            } else if (state == NO_QUARTER) {
                System.out.println("You need to pay first");
            } else if (state == SOLD_OUT) {
                System.out.println("No gumball dispensed");
            } else if (state == HAS_QUARTER) {
                System.out.println("No gumball dispensed");
            }
        }
    
        public void refill(int numGumBalls) {
            this.count = numGumBalls;
            state = NO_QUARTER;
        }
    
        public String toString() {
    	// 구현
        }
    }
    ```
    

```java
public class GumballMachine {
    final static int SOLD_OUT = 0;
    final static int NO_QUARTER = 1;
    final static int HAS_QUARTER = 2;
    final static int SOLD = 3;

    int state = SOLD_OUT;
    int count = 0;

    public GumballMachine(int count) {
        this.count = count;
        if (count > 0) {
            state = NO_QUARTER;
        }
    }

    public void insertQuarter() {
       // 동전이 들어올 때 해야할 일 
    }

    public void ejectQuarter() {
       // 동전을 반환할 때 해야할 일
    }

    public void turnCrank() {
       // 손잡이가 돌아갔을 때 해야할 일 
    }

    private void dispense() {
       // 알맹이를 내보낼 때 해야할 일
    }
}
```

<aside>
🚨 이렇게 구현하면 새로운 요청 사항이 생겼을 때 모든 메서드에 조건문을 전부 추가해줘야 한다.
**확장이 어려움**

</aside>

- 이 코드는 OCP 를 지키고 있지 않음.
- 상태전환이 복잡한 조건문 속에 숨어서 분명하게 드러나지 않음.
- 바뀌는 부분을 전혀 캡슐화하지 않았음.
- 새로운 기능을 추가하는 과정에서 기존 코드에 없던 새로운 버그가 생길 가능성이 높음.

# 새로운 디자인 구성

- 뽑기 기계와 관련된 모든 행동에 관한 메소드가 들어있는  State 인터페이스를 정의
- 기계의 모든 상태를 캡슐화해서  State 인터페이스를 구현하는 상태 클래스 생성
- 조건문 코드를 전부 없애고 상태 클래스에 모든 작업을 위임

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e7e38ba9-5fba-415b-87aa-4a8148635df5/Untitled.png)

# State 클래스 구현하기

```java
public class NoQuarterState implements State {
  GumballMachine gumballMachine;

  public NoQuarterState(GumballMachine gumballMachine) { // 1
    this.gumballMachine = gumballMachine;
  }
 
    public void insertQuarter() { // 2
        System.out.println("동전을 넣으셨습니다");
        gumballMachine.setState(gumballMachine.getHasQuarterState());
    }

    public void ejectQuarter() { //3
        System.out.println("동전을 넣어주세요");
    }

    public void turnCrank() { //4
        System.out.println("동전을 넣어주세요");
    }

    public void dispense() { //5
        System.out.println("동전을 넣어주세요");
    }
```

1. 생성자로부터 뽑기 기계의 레퍼런스가 전달. 이 레퍼런스를 인스턴스 변수에 저장
2. 누군가가 동전을 넣으면 동전이 투입되었다는 메시지를 출력하고 기계의 상태를 HasQuarterState로 전환.

3,4,5. 발생하면 예외처리. 안내메세지 출력 

<aside>
🚨 상태에 맛게 적절한 행동을 구현하고, 상황에 따라 뽑기 기계의 상태가 다른 상태로 전환될 수 있음.

</aside>

# 뽑기 기계 코드 수정하기

```java
public class GumballMachine {
    // 1
    State soldOutState;
    State noQuarterState;
    State hasQuarterState;
    State soldState;

    State state;
    int count = 0;

		// 2.     
    public GumballMachine(int numberGumballs) {
        soldOutState = new SoldOutState(this);
        noQuarterState = new NoQuarterState(this);
        hasQuarterState = new HasQuarterState(this);
        soldState = new SoldState(this);

        this.count = numberGumballs;
         if (numberGumballs > 0) {
            state = noQuarterState;
        } else {
            state = soldOutState;
        }
    }

		// 3. 
    public void insertQuarter() {
        state.insertQuarter();
    }

    public void ejectQuarter() {
        state.ejectQuarter();
    }

    public void turnCrank() {
        state.turnCrank();
        state.dispense();
    }

		// 4.
    void setState(State state) {
        this.state = state;
    }

  // 기타 메소드..
}
```

1. 정적 정수 변수를 사용하던 코드를 새로 만든 클래스를 사용하는 방식으로 수정.
    1. 정수가 아니라 상태 객체가 저장.
2. 상태 객체를 생성하고 대입하는 작업은 생성자가 처리. 상태 초기화
3. 메소드 구현. 현재 상태가 작업을 처리하게 만듬.
4. setState 메소드를 사용해, 안에 들어있는 뽑기 기계의 상태를 다른 상태로 전호나할 수 있음.

# 뽑기 기계 구조 다시 살펴보기

- 각 상태의 행동을 별개의 클래스로 국지화
- 관리하기 힘든 if 선언문들을 없앰.
- 각 상태를 변경에는 닫혀 있게 했고, GumballMachine 클래스는 새로운 상태 클래스를 추가하는 확장에는 열려 있도록 고침(OCP)
- 훨씬 더 이해하기 좋은 코드 베이스와 클래스 구조를 만듬.

# 상태 패턴의 정의

> 상태 패턴(State Pattern) 을 사용하면 **1) 객체의 내부 상태가 바뀜에 따라서 객체의 행동을 바꿀 수 있다**. **2) 마치 객체의 클래스가 바뀌는 것과 같은 결과를 얻을 수 있다.**
> 

1) 상태를 별도의 클래스로 캡슐화한 다음. 현재 상태를 나타내는 객체에게 행동을 위임하므로 내부 상태가 바뀔 때 행동이 달라지게 된다는 사실을 쉽게 알 수 있음.

2) 클라이언트의 관점에서 지금 사용하는 객체의 행동이 완전히 달라진다면, 마치 그 객체가 다른 클래스로부터 만들어진 객체처럼 느껴짐.

# 상태패턴과 전략 패턴의 용도

- 상태 패턴
    - 상황에 따라 현재 상태를 나타내는 객체가 바뀌고, 그 결과로 Context 객체의 행동도 바뀜.
    - 클라이언트는 상태 객체를 몰라도됨.
- 전략 패턴
    - 클라이언트가 Context 객체에게 어떤 전략 객체를 사용할지를 지정해줌.
    - 주로 실행 시에 전략 객체를 변경할 수 있는 유연성을 제공하는 용도로 쓰임.
    

# 추가

- **Q1. 반드시 구상 상태 클래스에서 다음 상태를 결정해야 하나?**
    - 아니다. Context 에서 상태 전환 흐름을 결정하도록 할 수 있다.
    - 상태 전환 코드를 상태 클래스에 넣으면, 상태 클래스 사이에 의존성이 생긴다는 단점이 있다.
    - 위에 구현 코드를 보면 구상 상태 클래스를 코드에 직접 넣는 대신 Context객체의 게터 메소드를 써서 의존성을 최소화하려고 노력했다.
- **Q2. 클라이언트에서 상태 겍체와 직접 연락하는 경우?**
    - 없음. 상태 요청은 전부  Context 로부터 오게됨. 직접 상태를 바꿀 수 없음.
- **Q3. 여러 Context 에서 상태 객체를 공유할 수 있는가?**
    - 상태 객체 내에 자체 상태를 보관하지 않아야 한다는 조건만 만족하면 상관없음.
    - 상태를 공유할때는 일반적으로 각 상태를 정적 인스턴스 변수에 할당하는 방법을 씀.
- **Q4. 디자인에 필요한 클래스의 개수가 늘어나지 않나?**
    - 조금 귀찮아도 클래스를 추가해서 유연한 디자인을 만드는 것이 좋음.
    - 실제 클래스 개수보다는 클라이언트에게 노출되는 클래스 개수가 중요함.

# 🤓 유한 상태 기계

<img width="1085" alt="image" src="https://user-images.githubusercontent.com/51521314/224484078-5ebad5e0-639c-4844-b707-b8240767c101.png">
- 상태들의 수가 유한하다.
- 어떤 고유한 상태 내에서든 프로그램은 다르게 행동, 한 상태에서 다른 상태로 즉시 전환될 수 있다.
- 현재의 상태에 따라 프로그램은 특정 다른 상태로 전환되거나, 전환되지 않을 수 있다. **`(전이 transition)`**
- 이러한 규칙들은 유한하고, 미리 결정되어 있다.
