(function($) {
    $.fn.qaconn.lang = function(textId) {
        lang = {
            ok: "Aciertos",
            fail: "Fallos",
            level: "Nivel",
            RT: "Tiempo de Resuesta",
            good: "Bueno",
            medium: "Medio",
            low: "Bajo",
            bad: "Malo",
            unknown: "Desconocido"
        };
        return lang[textId];
    };
}(jQuery));

