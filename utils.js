const user_config = {
    contentsPerPage: 6,
    websiteTitle:"BLOG"
}

function pagination(req_url, document_length) {
    let last_page = 1
    if (user_config.contentsPerPage == 1) {
        last_page = document_length
    } else if (user_config.contentsPerPage != document_length) {
        last_page = Math.floor(document_length / user_config.contentsPerPage) + 1;
    }

    let current_page = req_url.split('=')[1]
    if (current_page != undefined && current_page > last_page) {
        current_page = last_page;
    }
    if (current_page == 1) {
        current_page = undefined;
    }

    let strt = ((current_page - 1) * user_config.contentsPerPage);;
    let end = 0;
    if (current_page == undefined) {
        strt = 0;
    }

    if (current_page == undefined || current_page == 1) {
        prev = "#"
        if (last_page > 1) {
            next = "/?page=" + 2;
        } else {
            next = "#";
        }
    } else if (current_page >= last_page) {
        prev = "/?page=" + (current_page - 1)
        next = "#";
    } else {
        prev = "/?page=" + (current_page - 1)
        next = "/?page=" + (Number(current_page) + 1)
    }
    end = strt + user_config.contentsPerPage;

    if (current_page == undefined) {
        current_page = 1
    }
    return [prev, next, strt, end, current_page]
}

function shortifyDescs(temp_documents) {
    temp_documents.forEach(element => {
        dsc = element.desc.split(' ').slice(0, 25);
        dsc_string = ""
        dsc.forEach(elem => {
            dsc_string += elem + " ";
        })
        element.desc = dsc_string + "...";
    })
    return temp_documents;
}

function cookieParser(raw) {
    cookies = {}
    if (raw == undefined) {
        cookies["isLoggedIn"] = false;
        cookies["user_ID"] = "NaN";
        return cookies
    }
    raw = raw.split('; ');
    raw.forEach(element => {
        element = element.split("=");
        cookies[element[0]] = element[1];
    })
    cookies.user_ID = cookies.user_ID.replace("%40", "@");
    return cookies
}

module.exports = {user_config,pagination,shortifyDescs,cookieParser}