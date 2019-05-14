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
    $('#table').show();

    // algoritimos Não Preemptivos 
    if (!preemptivo) {
        processosOrdenados.forEach(processo => {
            dataEsperando.push(relogio - processo.chegada);

            relogio += processo.execucao;
            soma += relogio - processo.chegada;

            dataExecutando.push(relogio);
        });

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
        $('#table').show();

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
    }

    $('#turnaround').html('Turnaround Médio ' + algoritmo + ': ' + (soma / processosOrdenados.length)).show();
}