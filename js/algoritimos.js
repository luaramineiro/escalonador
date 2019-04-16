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
    var labelsProcessos = [];
    var dataEsperando = [];
    var dataNaoChegou = [];
    var dataExecutando = [];
    var dataSobrecarga = [];

    // algoritimos Não Preemptivos 
    if (!preemptivo) {
        processosOrdenados.forEach(processo => {
            if ((relogio - processo.chegada) > 0)
                dataEsperando.push(relogio - processo.chegada);
            else
                dataEsperando.push(0);
            labelsProcessos.push(processo.pid);
            dataNaoChegou.push(processo.chegada);
            dataExecutando.push(processo.execucao);

            relogio += processo.execucao;
            soma += relogio - processo.chegada;
        });
    }

    // algoritimos Preemptivos 
    if (preemptivo) {
        var count_finalizados = 0;
        var quantum = parseInt($('#quantum').val());
        var sobrecarga = parseInt($('#sobrecarga').val());
        while (true) {
            for (let index = 0; index < processosOrdenados.length; index++) {
                console.log('Processo ' + processosOrdenados[index].pid)
                if (processosOrdenados[index].falta_executar > 0) {
                    // Primeira vez que o processo entra no while
                    if (processosOrdenados[index].falta_executar == processosOrdenados[index].execucao) {
                        labelsProcessos.push(processosOrdenados[index].pid);
                        dataNaoChegou.push(processosOrdenados[index].chegada);
                        if ((relogio - processosOrdenados[index].chegada) > 0)
                            dataEsperando.push(relogio - processosOrdenados[index].chegada);
                        else
                            dataEsperando.push(0);
                    }

                    // Não vai utilizar todo o quantum
                    if (processosOrdenados[index].falta_executar - quantum < 0) {
                        processosOrdenados[index].falta_executar = 0;
                        dataExecutando.push(processosOrdenados[index].falta_executar - quantum);
                    }
                    // Vai utilizar todo o quantum
                    else {
                        processosOrdenados[index].falta_executar = processosOrdenados[index].falta_executar - quantum;
                        dataExecutando.push(quantum);
                    }

                    // Só tem sobrecarga se ele precisar executar novamente
                    if (processosOrdenados[index].falta_executar > 0) {
                        relogio += quantum + sobrecarga;
                        dataSobrecarga.push(sobrecarga);
                    }
                    else {
                        relogio += quantum;
                    }
                }

                // Só contar como finalizado apenas 1 vez
                if (processosOrdenados[index].falta_executar == 0) {
                    processosOrdenados[index].falta_executar = -1;
                    count_finalizados += 1;
                    soma += relogio - processosOrdenados[index].chegada;
                }
            }

            if (count_finalizados == processosOrdenados.length)
                break;
        }
    }

    console.log(dataExecutando);
    console.log(dataSobrecarga);
    console.log(dataNaoChegou);
    console.log(dataEsperando);

    $('#myChart').html('');

    var ctx = document.getElementById('myChart');
    var myChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: labelsProcessos,
            datasets: [{
                data: dataNaoChegou,
                backgroundColor: "#c1c1c126",
                label: "Não Chegou",
                borderWidth: 1
            }, {
                data: dataEsperando,
                backgroundColor: "#ffd060",
                label: "Esperando",
                borderWidth: 1
            }, {
                data: dataExecutando,
                backgroundColor: "#a4dfdf",
                label: "Executando",
                borderWidth: 1
            }, {
                data: dataSobrecarga,
                backgroundColor: "#ff7793",
                label: "Sobrecarga",
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    id: 'x-axis-1',
                    stacked: true,
                    ticks: { stepSize: 1 }
                }],
                yAxes: [{
                    id: 'y-axis-1',
                    stacked: true,
                    ticks: { beginAtZero: true }
                }]
            }
        }
    });

    window.location.href = '#myChart';

    $("#myChart").show();
    $('#turnaround').html('Turnaround Médio ' + algoritmo + ': ' + (soma / processosOrdenados.length)).show();
}