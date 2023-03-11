import {assign, createMachine, interpret} from 'xstate';

// machine.transition(...) is a pure function used by the interpreter.
const GumballMachine = createMachine({
    predictableActionArguments:true,
    // Machine identifier
    id: 'gumballMachine',

    // Initial state
    initial: 'noQuarterState',

    // Local context for entire machine
    context: {
        count: 0,
    },

    // State definitions
    states: {
        noQuarterState: {
            on:{
                INSERT:{
                    target: "hasQuarterState",
                    actions: ['insertQuarters']
                },
                EJECT:{
                    actions: ['notifyInsertQuarter']
                },
                TURN_CRANK:{
                    actions: ['notifyInsertQuarter']
                },
                DISPENSE:{
                    actions: ['notifyInsertQuarter']
                }
            }
        },
        hasQuarterState: {
            on:{
                INSERT:{
                    actions: ['notifyInsertOnlyOneQuarter']
                },
                EJECT:{
                    target: "noQuarterState",
                    actions: ['ejectQuarter']
                },
                TURN_CRANK:{
                    target: "soldState",
                    actions: ['turnCrank']
                },
                DISPENSE:{
                    actions: ['notifyCanNotDispense']
                }
            }
        },
        soldState: {
            on: {
                INSERT:{
                    actions: ['notifyIsDispensing']
                },
                EJECT:{
                    actions: ['notifyIsDispensing']
                },
                TURN_CRANK:{
                    actions: ['notifyIsDispensing']
                },
                DISPENSE:{
                    target: 'noQuarterState',
                    actions: ['dispense']
                }
            }
        },
    },
},{
    actions:{
        insertQuarters: assign((context, event) => {
            console.log('동전을 넣으셨습니다.');
            return {count: context.count + 1}
        }),
        ejectQuarter: assign((context, event)=>{
            console.log("동전이 반환됩니다.");
            return {count: context.count -1 1}
        }),
        turnCrank: assign((context, event)=>{
            console.log("손잡이를 돌리셨습니다.")
        }),
        dispense: assign((context, event)=> {
            console.log('알맹이를 내보내고 있습니다.');
            return {count : context.count - 1};
        }),
        notifyInsertQuarter: assign((context, event)=> {
            console.log('동전을 넣어주세요.');
        }),
        notifyInsertOnlyOneQuarter: assign((context, event)=> {
            console.log('동전은 한개만 넣어주세요');
        }),
        notifyCanNotDispense: assign((context, event)=>{
            console.log('알맹이를 내보낼 수 없습니다.')
        }),
        notifyIsDispensing: assign((context, event)=>{
            console.log('알맹이를 내보내고 있습니다.')
        }),
    }
});

const GumballService = interpret(GumballMachine)
    .onTransition((state)=> console.log(state.value, state.context))
    .start();

GumballService.send("DISPENSE")
// 동전을 넣어주세요.

GumballService.send("INSERT")
// 동전을 넣으셨습니다.
// hasQuarterState { count: 1 }

GumballService.send("TURN_CRANK")
// 손잡이를 돌리셨습니다.
// soldState { count: 1 }

GumballService.send("DISPENSE")
// 알맹이를 내보내고 있습니다.
// noQuarterState { count: 0 }


