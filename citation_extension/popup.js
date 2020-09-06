  let parseButton = document.getElementById('parse_citation_info');
  parseButton.onclick = function(element) {
    let color = element.target.value;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(
          tabs[0].id,
          {code: `
                   function getLcsLengths(str1, str2){
                   	var result = [];
					for (var i = -1; i < str1.length; i = i + 1) {
					result[i] = [];
					for (var j = -1; j < str2.length; j = j + 1) {
					  if (i === -1 || j === -1) {
					    result[i][j] = 0;
					  } else if (str1[i] === str2[j]) {
					    result[i][j] = result[i - 1][j - 1] + 1;
					  } else {
					    result[i][j] = Math.max(result[i - 1][j], result[i][j - 1]);
					  }
					}
					}
					return result;
                   }
                   function getLcs(str1, str2, lcsLengthsMatrix) {
					var execute = function (i, j) {
					if (!lcsLengthsMatrix[i][j]) {
					  return '';
					} else if (str1[i] === str2[j]) {
					  return execute(i - 1, j - 1) + str1[i];
					} else if (lcsLengthsMatrix[i][j - 1] > lcsLengthsMatrix[i - 1][j]) {
					  return execute(i, j - 1);
					} else {
					  return execute(i - 1, j);
					}
					};
					return execute(str1.length - 1, str2.length - 1);
		   }
                   //var paper_name = decodeURIComponent(location.href.split('&')[1].split('=')[1]).toLowerCase();
                   var paper_name = document.getElementById("gs_hdr_tsi").value.toLowerCase();
                   var citation_str = "0";
                   //document.getElementsByClassName("gs_fl")[1].innerText;
                   //document.getElementsByClassName("gs_ri")[0]["children"][0].innerText
                   var all_paper_divs = document.getElementsByClassName("gs_ri");
		   var title_matched = false;
                   for(var i=0;i<all_paper_divs.length;i++)
                   {
                     if(all_paper_divs[i]["children"][0].innerText.toLowerCase()==paper_name)
                     {
		       all_paper_divs[i].style="background-color: yellow;"
                       var x = all_paper_divs[i]["children"][3].innerText.toLowerCase();
		       if(x.includes("cited by"))
		       {
			 citation_str = x.split("cited by")[1].split(' ')[1]+"";
		       }
		       title_matched = true;
                       break;
                     }
                   }
		   if(!title_matched)
		   {
		     var max_lcs = 0;
		     var max_i = 0;
                     for(var i=0;i<all_paper_divs.length;i++)
		     {
			var str1 = all_paper_divs[i]["children"][0].innerText.toLowerCase();
			var str2 = paper_name;
			var lcsLengthsMatrix = getLcsLengths(str1, str2);
			var lcs_len = getLcs(str1, str2, lcsLengthsMatrix).length;
                        if(max_lcs<lcs_len)
			{
			  max_lcs = lcs_len;
			  max_i = i;
			}
		     }
                     all_paper_divs[max_i].style="background-color: red;";
                     var x = all_paper_divs[max_i]["children"][3].innerText.toLowerCase();
                     if(x.includes("cited by"))
                     {
                         citation_str = x.split("cited by")[1].split(' ')[1]+"";
                     }
		   }
		   chrome.storage.sync.get('all_paper_info', function(data) {
    			chrome.storage.sync.set({all_paper_info: data.all_paper_info+paper_name+";"+citation_str+";"}, function() {
    			});
  		   });
                 `
          });
    });
  };

  let copyButton = document.getElementById('copy_citation_info');
  copyButton.onclick = function(element) {
    let color = element.target.value;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(
          tabs[0].id,
          {code: `
                   chrome.storage.sync.get('all_paper_info', function(data) {
                   var tmpElem = document.createElement("DIV");
                   tmpElem.innerText = data.all_paper_info+"";
                   document.body.append(tmpElem);
                   var range = document.createRange();
                   range.selectNodeContents(tmpElem);
                   selection = window.getSelection();
                   selection.removeAllRanges();
                   selection.addRange(range);
                   try{
                     success = document.execCommand("copy", false, null);
                   }catch(e){
                     copyToClipboardFF(input.val());
                   }
                   if(success){
                     tmpElem.remove();
                   }
                   });
		   chrome.storage.sync.set({all_paper_info: ''}, function() {
                   });
                 `
          });
    });
  };
