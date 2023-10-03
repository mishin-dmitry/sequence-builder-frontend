export const golub = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320">
  <path
    d="M6.508,209.1l13.325,1.5a1.955,1.955,0,0,0,.524-.009c8-1.216,17.128-2.322,18.548-2.076,2.221.577,45.179,3.177,58.292,3.96.04,0,.079,0,.119,0h.038l29.014-.551a45.01,45.01,0,0,0,19.809-5.043l12.269-6.38a116.2,116.2,0,0,0,11.307-6.737,6.858,6.858,0,0,0-.258,3.7l.805,3.852a14.512,14.512,0,0,0,10.432,11.085l1.985.541a6.853,6.853,0,0,0,4.871-.482l.453-.227a6.9,6.9,0,0,0,3.555-7.891l28.056-2.038,16.545,6.966a2.012,2.012,0,0,0,.777.157H244.1a2,2,0,0,0,1.239-3.57l-9.859-7.783,11.419-5.254a11.465,11.465,0,0,0,6.359-7.669l.311-1.246a11.516,11.516,0,0,0-7.468-13.7,124.315,124.315,0,0,0-16.92-4.468c-8.942-1.626-22.384-4.6-27.252-5.686l4.917-17.528a12.007,12.007,0,0,1,1.217-2.915l2.034-3.484a15.952,15.952,0,0,0-5.821-21.863c-.044-.026-.09-.049-.135-.072l-11-5.255V96.648a12.521,12.521,0,0,0,5.136-1.917c2.737-1.859,3.671-7.172,3.973-9.835l4.02-1.475a2,2,0,0,0,1.189-2.567L205.093,74.4c-.156-1.575-.979-9.655-1.925-14.176a16.771,16.771,0,0,0-8.686-10.938,24.669,24.669,0,0,0-18.707-.813,11.069,11.069,0,0,0-19.5,10.2,11.872,11.872,0,0,0,6.537,6.931,17.443,17.443,0,0,0-.2,4.285c.6,6.966,2.577,16.166,8.583,20.44.862.614,1.751,1.224,2.663,1.807v9.032c-.23.015-.461.022-.691.052a10.6,10.6,0,0,0-9.146,11.675l4.441,39.976-6.524,4.783a33.847,33.847,0,0,0-8.2,8.59l-4.39,6.607a22.186,22.186,0,0,1-10.729,8.537c-4.431,1.655-15.552,4.333-33.054,7.957l-1.474.307c-1.526.326-9.64-.159-16.8-.586-10.494-.626-21.346-1.275-24.9-.516-4.342.924-17.147,5.035-24.8,7.492-1.94.623-3.8,1.22-4.72,1.507a31.072,31.072,0,0,1-3.129-2.967,6.094,6.094,0,0,0-7.149-1.183l-7.34,3.784-9.247,1.966a5.05,5.05,0,0,0,.487,9.958Zm191.774-21.926-3.1.8L182.6,183.741c.248-.223.5-.438.75-.664l4.294-3.934Zm-19.2-.4,8.983,3.025-5.081,1.306-6.148-1.537a5.55,5.55,0,0,0-1.053-.153Q177.462,188.13,179.087,186.779Zm8.54,18.264a2.874,2.874,0,0,1-1.375,3.617l-.452.227a2.849,2.849,0,0,1-2.03.2l-1.985-.541a10.529,10.529,0,0,1-7.569-8.043l-.805-3.853a2.856,2.856,0,0,1,1.235-2.989,1.544,1.544,0,0,1,1.224-.208l6.641,1.66a2,2,0,0,0,.983,0l18.866-4.851,11.223,8.48L190.1,200.445l-1.169-2.923-3.715,1.487Zm38.422-14.412-8.2-7.516a39.5,39.5,0,0,1,6.959-1.14c3.514,1.953,7.448,4.488,8.023,5.35.6,1.119,1.865,4.139,2.751,6.305L231.96,195.3Zm2.42-20.95A119.987,119.987,0,0,1,244.824,174a7.514,7.514,0,0,1,4.867,8.937l-.311,1.247a7.479,7.479,0,0,1-4.15,5l-6.009,2.766c-.847-2.069-2.161-5.207-2.859-6.515-.562-1.053-2.259-2.409-4.23-3.729,2.343.014,4.378.11,5.7.216l.318-3.988c-.672-.056-15.468-1.186-23.67,2.085l-14.438-13.234.807-2.876C205.552,164.969,219.324,168.018,228.469,169.681Zm-31.731-5.919-5.2-4.767-.4-4.364,7.568,2.112Zm9.831-41.818a11.953,11.953,0,0,1,.076,12.172l-2.034,3.485a15.921,15.921,0,0,0-1.619,3.87l-3.2,11.42-9.036-2.523L187.6,115.782A18.358,18.358,0,0,0,186.079,110l16.268,7.771A12,12,0,0,1,206.569,121.944ZM160.015,57.238a7.207,7.207,0,0,1,4.143-9.3,7.1,7.1,0,0,1,8.058,2.44,23.955,23.955,0,0,0-8.379,11.329A8.1,8.1,0,0,1,160.015,57.238Zm16.252-4.628c4.75-2.271,11.24-2.154,16.532.3a12.564,12.564,0,0,1,4.956,4.618,348.064,348.064,0,0,0-27.136,26.344c-2.089-3.282-3.484-8.19-4.014-14.333C166.063,63.244,170.577,55.333,176.267,52.61Zm-2.976,34.273a340.258,340.258,0,0,1,26.044-25.421c.951,4.806,1.792,13.487,1.8,13.577a1.987,1.987,0,0,0,.113.5l1.769,4.817-3.33,1.222a2,2,0,0,0-1.306,1.744c-.224,3.294-1.221,7.336-2.35,8.1-4.425,3.007-12.722.6-15.159-.214a29.525,29.525,0,0,1-7.35-4.143C173.444,87.01,173.369,86.943,173.291,86.883ZM179.61,95h0a36.237,36.237,0,0,0,9.533,1.843v10.184l-9-4.3h0a10.555,10.555,0,0,0-2.279-1.072V94.318C178.441,94.572,179.02,94.807,179.61,95ZM169,108.181a6.6,6.6,0,0,1,10.021-1.321,14.331,14.331,0,0,1,4.6,9.286l4.009,43.983a2,2,0,0,0,.641,1.293L223.4,193.63c.037.033.075.064.113.095l14.829,11.707h-.964l-18.749-7.894-43.881-33.154a3.107,3.107,0,0,1-1.209-2.126l-5.534-49.809A6.616,6.616,0,0,1,169,108.181Zm-64.064,85.381,1.454-.3c6.6-1.366,26.677-5.525,33.646-8.129a26.166,26.166,0,0,0,12.657-10.069l4.39-6.607a29.832,29.832,0,0,1,7.234-7.576l4.668-3.423.582,5.244a7.122,7.122,0,0,0,2.774,4.876l12.065,9.116-3.752,3.437A112.256,112.256,0,0,1,156.6,196.96l-12.27,6.38a40.977,40.977,0,0,1-18.039,4.592l-28.935.55L95.9,208.4l.36-14.825C100.75,193.786,103.687,193.826,104.932,193.562Zm-98.078,9.5,9.507-2.023a1.977,1.977,0,0,0,.5-.179l7.58-3.906a2.076,2.076,0,0,1,2.431.4c3.853,4.014,5.008,4.552,6.275,4.281.353-.075,1.391-.4,5.683-1.782,7.081-2.275,20.262-6.507,24.406-7.389,3.028-.644,14.559.045,23.827.6q2.8.166,5.2.3L91.9,208.154c-21.629-1.309-50.037-3.12-51.991-3.507-2.31-.6-14.472,1.133-19.892,1.954L6.955,205.13a1.05,1.05,0,0,1-.1-2.071Z" />
</svg>`