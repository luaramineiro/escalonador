// Variável global da lista de processos
var processos = [];

$(document.body).ready(function () {
    $('#myChart').hide();
    $('#turnaround').hide();

    // Limpa a tabela dos processos, o gráfico e lista de processos
    $('#btn-limpar').click(function (e) {
        $('#tabela-processos').html('');
        $('#myChart').hide();
        $('#turnaround').hide();
        processos = [];
    });

    $('#btn-adicionar').click(function (e) {
        e.preventDefault();
        var execucao = $('#execucao').val();
        var chegada = $('#chegada').val();
        var deadline = $('#deadline').val();
        var pid = Math.round(Math.random() * (99999 - 1000) + 1000) + "";

        // Adiciona o processo a tabela
        $('#tabela-processos').append('<tr> <td id="processoNome' +
            pid + '">' + pid + '</td> <td>' +
            chegada + '</td><td>' +
            execucao + '</td><td>' +
            deadline + '</td> <td></td>  </tr>');

        var processo = new Object();
        processo['pid'] = parseInt(pid);
        processo['execucao'] = parseInt(execucao);
        processo['chegada'] = parseInt(chegada);
        processo['deadline'] = parseInt(deadline);
        processo['faltaexecutar'] = parseInt(execucao);

        // Adiciona o processo a lista de processos
        processos.push(processo);

        $('#modalAdicionar').modal('hide');

        limparCamposModal();
    });
});

function limparCamposModal() {
    $('#execucao').val('');
    $('#chegada').val('');
    $('#deadline').val('');
}