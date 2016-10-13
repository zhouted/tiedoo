function init(headerId){
    let $header = $(headerId);
    $header.find('.ver.node').text(process.versions.node);
    $header.find('.ver.chrome').text(process.versions.chrome);
    $header.find('.ver.electron').text(process.versions.electron);
};

module.exports = {init}
