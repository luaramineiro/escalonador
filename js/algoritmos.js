var processosOrdenados = [];

$(document.body).ready(function () {
    // Ordenar a lista de processos por ordem de chegada
    $('#btn-fifo').click(function (e) {
        if (processos.length > 0) {
            processosOrdenados = processos.sort(function (a, b) {
                if (a.chegada < b.chegada)
                    return -1;
                if (a.chegada > b.chegada)
                    return 1;
                return 0;
            });
            gerarGrafico('FIFO');
        }
    });

    // Ordenar a lista de processos por ordem de tempo de execução
    $('#btn-sjf').click(function (e) {
        if (processos.length > 0) {
            processosOrdenados = processos.sort(function (a, b) {
                if ((a.chegada > 0) && (b.chegada > 0) && (a.chegada < b.chegada) && (a.execucao < b.execucao)) {
                    return -1;
                }
                if ((a.chegada > 0) && (b.chegada > 0) && (a.chegada > b.chegada) && (a.execucao > b.execucao)) {
                    return 1;
                }
                return 0;
            });
            gerarGrafico('SJF');
        }
    });

    // Lista Circular de processos por ordem de chegada
    $('#btn-round-robin').click(function (e) {
        if (processos.length > 0) {
            processosOrdenados = processos.sort(function (a, b) {
                if (a.chegada < b.chegada)
                    return -1;
                if (a.chegada > b.chegada)
                    return 1;
                return 0;
            });
            gerarGrafico('Round-Robin', true);
        }
    });

    $('#btn-edf').click(function (e) {
        alert('edf')
    });
});

function gerarGrafico(algoritmo, preemptivo = false, deadline = true) {
    var soma = 0;
    var relogio = 0;
    var dataEsperando = [];
    var dataExecutando = [];

    $('#tbody').html('');
    $('#tabela-relogio').show();

    // algoritimos Não Preemptivos 
    if (!preemptivo) {
        processosOrdenados.forEach(processo => {
            dataEsperando.push(relogio - processo.chegada);

            relogio += processo.execucao;
            soma += relogio - processo.chegada;

            dataExecutando.push(relogio);
        });

        criarQuadrados(relogio);

        //pintar quadrados (linha = processos / coluna = relogio)
        for (let coluna = 0; coluna < relogio; coluna++) {
            for (let linha = 0; linha < processosOrdenados.length; linha++) {
                const pid = processosOrdenados[linha].pid;
                const chegada = processosOrdenados[linha].chegada;
                //esperando
                if ((coluna >= chegada) && (dataEsperando[linha] > 0)) {
                    dataEsperando[linha]--;
                    setTimeout(function name() {
                        $('#tr-' + pid).find('#td-' + coluna).addClass('waiting');
                    }, coluna * 1000);
                }
                //executando
                else if ((coluna >= chegada) && (coluna < dataExecutando[linha])) {
                    setTimeout(function name() {
                        $('#tr-' + pid).find('#td-' + coluna).addClass('execute');
                    }, coluna * 1000);
                }

            }
        }
    }

    // algoritimos Preemptivos 
    if (preemptivo) {
        var quantum = parseInt($('#quantum').val());
        var sobrecarga = parseInt($('#sobrecarga').val());
        var executou = 0;
        limparDadosExecucaoDosProcessos();
        while (executou < processosOrdenados.length) {
            for (let index = 0; index < processosOrdenados.length; index++) {
                if ((!processosOrdenados[index].finalizou) && (processosOrdenados[index].faltaexecutar > 0)) {
                    const executando = (processosOrdenados[index].faltaexecutar - quantum >= 0) ? quantum : quantum - processosOrdenados[index].faltaexecutar;
                    relogio += executando;
                    processosOrdenados[index].faltaexecutar = processosOrdenados[index].faltaexecutar - executando;

                    // finalizou a execucao
                    if (processosOrdenados[index].faltaexecutar <= 0) {
                        executou++;
                        processosOrdenados[index].finalizou = true;
                        soma += relogio - processosOrdenados[index].chegada;
                    }
                    //sobrecarga
                    else {
                        relogio += sobrecarga;
                    }
                }
            };
        }

        criarQuadrados(relogio);

        executou = coluna = 0;
        limparDadosExecucaoDosProcessos();

        //pintar quadrados (linha = processos / coluna = relogio)
        while (executou < processosOrdenados.length) {
            for (let index = 0; index < processosOrdenados.length; index++) {
                const pid = processosOrdenados[index].pid;
                if ((!processosOrdenados[index].finalizou) && (processosOrdenados[index].faltaexecutar > 0)) {
                    //executando
                    const executando = (processosOrdenados[index].faltaexecutar - quantum >= 0) ? quantum : quantum - processosOrdenados[index].faltaexecutar;
                    for (let index2 = coluna; index2 < (executando + coluna); index2++) {
                        setTimeout(function name() {
                            $('#tr-' + pid).find('#td-' + index2).addClass('execute');
                        }, index2 * 1000);
                        // esperando
                        processosOrdenados.forEach(processo2 => {
                            if ((!processo2.finalizou) && (index2 >= processo2.chegada) && (processo2.pid != pid)) {
                                setTimeout(function name() {
                                    $('#tr-' + processo2.pid).find('#td-' + index2).addClass('waiting');
                                }, index2 * 1000);
                            }
                        });
                    }
                    coluna += executando;

                    processosOrdenados[index].faltaexecutar = processosOrdenados[index].faltaexecutar - executando;

                    // finalizou a execucao
                    if (processosOrdenados[index].faltaexecutar <= 0) {
                        processosOrdenados[index].finalizou = true;
                        executou++;
                    }
                    //sobrecarga
                    else {
                        for (let index2 = coluna; index2 < (sobrecarga + coluna); index2++) {
                            setTimeout(function name() {
                                $('#tr-' + pid).find('#td-' + index2).addClass('overload');
                            }, index2 * 1000);
                            // esperando
                            processosOrdenados.forEach(processo2 => {
                                if ((!processo2.finalizou) && (index2 >= processo2.chegada) && (processo2.pid != pid)) {
                                    setTimeout(function name() {
                                        $('#tr-' + processo2.pid).find('#td-' + index2).addClass('waiting');
                                    }, index2 * 1000);
                                }
                            });
                        }
                        coluna += sobrecarga;
                    }
                }
            };
        }
    }

    $('#turnaround').html('Turnaround Médio ' + algoritmo + ': ' + (soma / processosOrdenados.length)).show();
}

function criarQuadrados(relogio) {
    //cria quadrados
    processosOrdenados.forEach(processo => {
        const pid = processo.pid;
        $('#tbody').append('<tr id="tr-' + pid + '"><td>' + pid + '&nbsp;</td></tr>');
        for (let index = 0; index < relogio; index++) {
            $('#tr-' + pid).append('<td class="square" id="td-' + index + '"></td>');
        }
    });
    $('#tbody').append('<tr id="numbers"></tr>');
    for (let index = 0; index <= relogio; index++) {
        $('#numbers').append('<td class="text-right font-size-small">' + index + '</td>');
    }
    $('#tabela-relogio').show();
}

function limparDadosExecucaoDosProcessos() {
    for (let index = 0; index < processosOrdenados.length; index++) {
        processosOrdenados[index].faltaexecutar = processosOrdenados[index].execucao;
        processosOrdenados[index].finalizou = false;
    }
}