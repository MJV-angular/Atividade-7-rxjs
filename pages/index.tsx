/* eslint-disable */
import React, { useEffect, useRef } from 'react';
import RxViz from '../components/RxViz';
import Head from 'next/head';
import {
  // Classes base
  Observable, Subject,
  // operadores de criação de Observables
  fromEvent,
  interval,
  of,
  combineLatest,
  forkJoin,
  merge,
  concat,
  throwError,
} from 'rxjs';
import {
  // Operadores "pipeable", para serem utilizados dentro da função "pipe"
  map,
  mapTo,
  tap,
  mergeMap,
  mergeAll,
  switchMap,
  take,
  groupBy,
  delay,
  share,
  filter,
  debounceTime,
  throttleTime,
  retry,
  reduce,
  scan,
  withLatestFrom,
  switchMapTo,
  concatAll,
  startWith,
  distinctUntilChanged,
  exhaustMap,
  finalize,
  takeUntil,
  timeout,
  catchError,
  concatMap,
  bufferCount,
  skip
} from 'rxjs/operators';

let countClicks = 0;

// função para simular uma requisição com possibilidade de dar algum erro.
function simulateRequest(errorChance = 0.5, requestTime: number = 500, value = 'R') {
  console.log('request start')
  return of(value)
    .pipe(
      delay(requestTime),
      tap(() => {
        console.log('request end')
        if (Math.random() >= 1 - errorChance) {
          console.log('request error')
          throw new Error("Erro")
        }
      })
    )
};

// Função do componente do React
export default function Index() {

  let countClicks = 0;
  const inputRef = useRef<HTMLInputElement>(null);

  // --------------------------------------------------Atividades--------------------------------------------------//

  const interval$ = interval(1100);

  // 1. Faça um observable que transforme os valores de interval$ em um valor constante (mapTo);

  const constante$ = interval$.pipe(
    mapTo(3)
  );

  // 2. Faça um observable que transforme os valores de interval$ em um valor calculado (map);

  const calculate$ = interval$.pipe(
    map(value => value % 2 == 0 ? value * 2 : value / 2)
  );

  // 3. Faça um observable que emita a soma dos valores emitidos pelo interval$ toda vez que ele emitir um valor (scan);

  const reduce$ = interval$.pipe(
    scan((acc, curr) => acc - curr)
  );

  // 4. Faça um observable que sempre que se fazer um click$, ele dispare uma requisição (simulateRequest) e emita o resultado no mesmo observable (mergeMap)

  const click$ = new Subject<number>();

  const outputClickMergeMap$ = click$.pipe(
    mergeMap(x => simulateRequest(0, 500, 'MM'))
  );

  // 5. Faça um observable que sempre que se um fazer click$, ele  dispare uma requisição (simulateRequest) e emita o resultado no mesmo observable, mas se for clickado uma outra vez antes da requisição terminar, ele cancele a requisição anterior e passe a escutar somente o resultado da requisição mais recente (switchMap)

  const outputClickSwitchMap$ = click$.pipe(
    switchMap(x => simulateRequest(0, 800, 'SM'))
  );


  // 6. Faça um observable que sempre que se um fazer click$, ele  dispare uma requisição (simulateRequest) e emita o resultado no mesmo observable, mas se for clickado mais vezes antes da requisição terminar, ele ignore os cliques até que a requisição seja terminada (exhaustMap)

  const outputExhaustMap$ = click$.pipe(
    exhaustMap(x => simulateRequest(0, 800, 'EM'))
  );

  // 7. Faça um observable que emita somente quando o usuário pressionar a key$ de "enter". (filter)

  const key$ = new Subject<string>();

  const outputKeyEnter$ = key$.pipe(filter(x => x === 'Enter'));

  // 8. Faça um observable que emita o valor total do input de texto somente quando o usuário parar de digitar por mais de 300 milisegundos (debounceTime)

  const input$ = new Subject<string>();
  const debounceTime$ = input$.pipe(debounceTime(300));

  // 9. Usando o observable do exercício 8, Simule uma situação de "pesquisa", ou seja, crie um novo observable que dispara uma requisição ao receber esse valor do input, e considera somente a última requisição caso seja emitido outro valor de input. (switchMap)

  const inputSwitchMap$ = input$.pipe(map(value => value.trim()), filter(value => value !== ""), switchMap(x => simulateRequest(0, 800, x)), distinctUntilChanged());

  // 10. Faça com que o observable de key$ não emita valores repetidos em sequência (distinctUntilChanged)

  const keydistinctUntilChanged$ = key$.pipe(distinctUntilChanged());

  // 11. Faça um observable que combine os últimos valores emitidos pelo interval$, click$ e input$ e emita sua combinação como uma tupla (combineLatest)
  const combineLatest$ = combineLatest([click$, input$, interval$]);


  useEffect(() => {
    document.addEventListener('click', (e) => {
      countClicks++;
      click$.next(countClicks);
    })

    document.addEventListener('keypress', (e) => {
      key$.next(e.key);
    })

    inputRef.current?.addEventListener('keydown', (e) => {
      key$.next(e.key);
    })
    inputRef.current?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      input$.next(target.value);
    })
  })

  // De forma geral, os Observables "cold" não fazem nada sem terem um subscriber, 
  // feito ao chamar o método ".subscribe(observer)" e passando um objeto de Observer
  // com os callbacks de next/error/complete:
  const subscription = interval$.subscribe({
    next: (value) => {
      console.log(`next count$: ${value}`);
    },
    error: (error) => {
      console.log(error);
    },
    complete: () => {
      console.log('complete');
    },
  })
  // podemos cancelar a subscription pelo método unsubscribe(),
  // porém, observables que completam ou tem erro já encerram automaticamente
  // e não é necessário fazer o unsubscribe manualmente (ex: chamadas http no Angular)
  subscription.unsubscribe();

  // Representa o tempo máximo representado na tela, ajuste para mais ou menos se preferir. Padrão de 30 segundos.
  const TIME = 30000;

  const observables: Array<[name: string, observable: Observable<any>]> = [
    ["interval", interval$],
    ["1-output", constante$],
    ["2-output", calculate$],
    ["3-output", reduce$],
    ["click$", click$],
    ["4-output", outputClickSwitchMap$],
    ["5-output", outputClickMergeMap$],
    ["6-output", outputExhaustMap$],
    ["7-output", outputKeyEnter$],
    ["8-output", debounceTime$],
    ["9-output", inputSwitchMap$],
    ["10-output", keydistinctUntilChanged$],
    ["11-output", combineLatest$]
  ]


  return (

    <div className="container" style={{ margin: "15px" }}>
      <Head>
        <title>RxViz - Devschool</title>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono|Montserrat:700"
          rel="stylesheet"
        />
        <style>{`body { margin: 0; font-family: Roboto }`}</style>
      </Head>

      {observables.slice(0, 9).map(([name, obs$]) => <div key={name}>
        <div><strong>{name}</strong></div>
        <RxViz
          timeWindow={TIME}
          observable$={obs$}
        />
      </div>
      )}
      <div style={{ width: "100%", padding:"10px 0"}}>
      <span>Input de texto: </span><input style={{height:"40px", margin:"20px 0"}}  id='input' ref={inputRef} />
      </div>
      
      {observables.slice(9).map(([name, obs$]) => <div key={name}>
        <div><strong>{name}</strong></div>
        <RxViz
          timeWindow={TIME}
          observable$={obs$}
        />
      </div>
      )}
    </div>
  )
}

