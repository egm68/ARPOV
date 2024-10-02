function video_to_frame_arr(video, number_of_frames){
  //let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  //let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
  //let frame_count = parseInt(cap.get(cv.CAP_PROP_FRAME_COUNT))
  let max_frame = number_of_frames
  let output_arr = []

  let cap = new cv.VideoCapture(video)
  let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  cap.read(frame, 0);
  //while (max_frame >= 0){
    //cap.read(frame);
    //max_frame = max_frame - 1
    //output_arr.push(frame)
  //}
  return frame
}

function append_ticks(frames, total_frames, type, obj_labels) {
  //total_frames = total_frames*.7

  for (var x = 0; x < frames.length; x++){
    percent = (frames[x]/total_frames)*100
    //parseInt((frames[x]/total_frames)*100)
    label = obj_labels[x]

    let title = '';
      
    if (type == "duplicates"){
      var tick_color = 'ticks-orange'
      title = 'Duplicates:' + label;
    }

    if (type == "new_objects"){
      var tick_color = 'ticks-green'
      title = 'New:' + label;
    }

    if (type == "removed_from_memory"){
      var tick_color = 'ticks-red'
    }

    if (type == "returned"){
      var tick_color = 'ticks-blue'
    }

    $("[slider] > div" ).append("<div class=" + tick_color + " style='left:"+ (percent + 1) + "%' title= " + title + "></div>");
    

    //append tick div on hover box here
    //let p = document.createElement("p");
    //div.append(p);
  }
  
  
}

function multiply(mat1, mat2, res)
{
    let i, j, k;
    for (i = 0; i < res.length; i++) {
        for (j = 0; j < res[i].length; j++) {
            res[i][j] = 0;
            for (k = 0; k < res.length; k++)
                res[i][j] += mat1[i][k] * mat2[k][j];
        }
    }
  return res
}
  

function divide_array_by_last_row(array){ //only works for 3x4
  array[0][0] = array[0][0]/array[2][0]
  array[1][0] = array[1][0]/array[2][0]
  array[2][0] = array[2][0]/array[2][0]

  array[0][1] = array[0][1]/array[2][1]
  array[1][1] = array[1][1]/array[2][1]
  array[2][1] = array[2][1]/array[2][1]

  array[0][2] = array[0][2]/array[2][2]
  array[1][2] = array[1][2]/array[2][2]
  array[2][2] = array[2][2]/array[2][2]

  array[0][3] = array[0][3]/array[2][3]
  array[1][3] = array[1][3]/array[2][3]
  array[2][3] = array[2][3]/array[2][3]

  return array
}

function divide_array_by_last_row_32(array){ //only works for 3x2
  array[0][0] = array[0][0]/array[2][0]
  array[1][0] = array[1][0]/array[2][0]
  array[2][0] = array[2][0]/array[2][0]

  array[0][1] = array[0][1]/array[2][1]
  array[1][1] = array[1][1]/array[2][1]
  array[2][1] = array[2][1]/array[2][1]
  
  return array
}

function divide_array_by_bottom_right_corner(array){ //only works for 3x3
  array[0][0] = array[0][0]/array[2][2]
  array[1][0] = array[1][0]/array[2][2]
  array[2][0] = array[2][0]/array[2][2]

  array[0][1] = array[0][1]/array[2][2]
  array[1][1] = array[1][1]/array[2][2]
  array[2][1] = array[2][1]/array[2][2]

  array[0][2] = array[0][2]/array[2][2]
  array[1][2] = array[1][2]/array[2][2]
  array[2][2] = array[2][2]/array[2][2]

  return array
}

//refilter object detection array passed to shader when checkbox is clicked
function checkboxUpdateFunction(){

  let all_obj_ids = ["jarOfNutButter", "jarOfJellyJam", "plate", "paperTowel", "cuttingBoard", "butterKnife", "person", "flourTortilla", "dentalFloss", "toothpicks"]
  let checked_obj_labels = []

  //get whether or not checkboxes are checked 
  for (let i = 0; i < all_obj_ids.length; i++){
    var checkbox = document.getElementById(all_obj_ids[i])
    if (checkbox.checked == true){
      checked_obj_labels.push(checkbox.value)
    }
  }
  
  return checked_obj_labels

}

//obj detection filters
//filter by frames being stitched
function filter_frames_being_stitched(){
  return obj_data[0].filter((el) => stitching_frames.includes(el.frame_index) == true);
}

function filter_confidence(confidenceThreshold, objects_by_frame_arr_frames_being_stitched){
  return objects_by_frame_arr_frames_being_stitched.map(function (el) { return {"frame_index": el.frame_index,"timestamp": el.timestamp, "DETIC_index": el.DETIC_index, "DETIC_data": el.DETIC_data.values.filter((el) => el.confidence >= confidenceThreshold) }});     
}

function filter_object_label(obj_labels_checked, objects_by_frame_arr_frames_being_stitched_conf){
  return objects_by_frame_arr_frames_being_stitched_conf.map(function (el) { return {"frame_index": el.frame_index,"timestamp": el.timestamp, "DETIC_index": el.DETIC_index, "DETIC_data": el.DETIC_data.filter((el) => obj_labels_checked.includes(el.label)) }});
}

function warp_to_panorama_case_study(objects_by_frame_arr_frames_being_stitched_conf_obj_label, anchorX, anchorY, scaleFactor, pano_width, pano_height, new_transf_list){
  let unique_obj_labels = ["Jar of nut butter", "Jar of jelly / jam", "plate", "paper towel", "cutting board", "butter knife", "person", "flour tortilla", "~12-inch strand of dental floss", "toothpicks"]
  var object_arr = []
  scaleFactor = 1
  for (i = 0; i < objects_by_frame_arr_frames_being_stitched_conf_obj_label.length; i++){
    if (objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].frame_index > dst_index) {
      for (j = 0; j < objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values.length; j++){
        //get bounding box
        var bounding_box_texture_coords = objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].xyxyn

        //convert bounding box to pixel coords 
        var bounding_box = [bounding_box_texture_coords[0], bounding_box_texture_coords[1], bounding_box_texture_coords[2], bounding_box_texture_coords[3]]

        //warp bounding box using translated homography matrix
        let lin_homg_pts = [[bounding_box[0], bounding_box[2]], [bounding_box[1], bounding_box[3]], [1, 1]]
        var trans_lin_homg_pts = [...Array(3)].map(e => Array(2));
        multiply(new_transf_list[i-1], lin_homg_pts, trans_lin_homg_pts)
        trans_lin_homg_pts = divide_array_by_last_row_32(trans_lin_homg_pts) 

        //convert warped pixel coords back into texture coords (using FULL PANORAMA WIDTH AND HEIGHT) 
        //apply scaleFactor
        //and store in vec3 format (x1 coord center, y1 coord center, index of obj label) and (x2 coord center, y2 coord center, index of obj label)
        object_arr.push({"x": (trans_lin_homg_pts[0][0]*scaleFactor) / pano_width, "y": 1 - ((trans_lin_homg_pts[1][0]*scaleFactor) / pano_height), "object_label": unique_obj_labels.indexOf(objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].label), "frame_index": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].frame_index, "confidence": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].confidence}) 
        object_arr.push({"x": (trans_lin_homg_pts[0][1]*scaleFactor) / pano_width, "y": 1 - ((trans_lin_homg_pts[1][1]*scaleFactor) / pano_height), "object_label": unique_obj_labels.indexOf(objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].label), "frame_index": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].frame_index, "confidence": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].confidence})
      }
    }else if (objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].frame_index < dst_index) {
        for (j = 0; j < objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values.length; j++){
          //get bounding box
          var bounding_box_texture_coords = objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].xyxyn
  
          //convert bounding box to pixel coords 
          var bounding_box = [bounding_box_texture_coords[0], bounding_box_texture_coords[1], bounding_box_texture_coords[2], bounding_box_texture_coords[3]]
  
          //warp bounding box using translated homography matrix
          let lin_homg_pts = [[bounding_box[0], bounding_box[2]], [bounding_box[1], bounding_box[3]], [1, 1]]
          var trans_lin_homg_pts = [...Array(3)].map(e => Array(2));
          multiply(new_transf_list[i], lin_homg_pts, trans_lin_homg_pts)
          trans_lin_homg_pts = divide_array_by_last_row_32(trans_lin_homg_pts) 
  
          //convert warped pixel coords back into texture coords (using FULL PANORAMA WIDTH AND HEIGHT) 
          //apply scaleFactor
          //and store in vec3 format (x1 coord center, y1 coord center, index of obj label) and (x2 coord center, y2 coord center, index of obj label)
          object_arr.push({"x": (trans_lin_homg_pts[0][0]*scaleFactor) / pano_width, "y": 1 - ((trans_lin_homg_pts[1][0]*scaleFactor) / pano_height), "object_label": unique_obj_labels.indexOf(objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].label), "frame_index": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].frame_index, "confidence": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].confidence}) 
          object_arr.push({"x": (trans_lin_homg_pts[0][1]*scaleFactor) / pano_width, "y": 1 - ((trans_lin_homg_pts[1][1]*scaleFactor) / pano_height), "object_label": unique_obj_labels.indexOf(objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].label), "frame_index": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].frame_index, "confidence": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].confidence})
        }
      }else{
      for (j = 0; j < objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values.length; j++){
        //get bounding box
        var bounding_box_texture_coords = objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].xyxyn

        //convert bounding box to pixel coords 
        var bounding_box = [bounding_box_texture_coords[0], bounding_box_texture_coords[1], bounding_box_texture_coords[2], bounding_box_texture_coords[3]]

        //warp bounding box using translated identity matrix (this is the base frame)
        var transf = [[1, 0, anchorX], [0, 1, anchorY], [0, 0, 1]]
        let lin_homg_pts = [[bounding_box[0], bounding_box[2]], [bounding_box[1], bounding_box[3]], [1, 1]]
        var trans_lin_homg_pts = [...Array(3)].map(e => Array(2));
        multiply(transf, lin_homg_pts, trans_lin_homg_pts)
        trans_lin_homg_pts = divide_array_by_last_row_32(trans_lin_homg_pts) 
                    
        //convert warped pixel coords back into texture coords (using FULL PANORAMA WIDTH AND HEIGHT) 
        //apply scaleFactor
        //and store in vec3 format (x1 coord center, y1 coord center, index of obj label) and (x2 coord center, y2 coord center, index of obj label)
        object_arr.push({"x": (trans_lin_homg_pts[0][0]*scaleFactor) / pano_width, "y": 1 - ((trans_lin_homg_pts[1][0]*scaleFactor) / pano_height), "object_label": unique_obj_labels.indexOf(objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].label), "frame_index": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].frame_index, "confidence": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].confidence}) 
        object_arr.push({"x": (trans_lin_homg_pts[0][1]*scaleFactor) / pano_width, "y": 1 - ((trans_lin_homg_pts[1][1]*scaleFactor) / pano_height), "object_label": unique_obj_labels.indexOf(objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].label), "frame_index": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].frame_index, "confidence": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].confidence})
      }
    }
  }
  return object_arr
}

function warp_to_panorama(objects_by_frame_arr_frames_being_stitched_conf_obj_label, anchorX, anchorY, scaleFactor, pano_width, pano_height, new_transf_list){
  let unique_obj_labels = ["Jar of nut butter", "Jar of jelly / jam", "plate", "paper towel", "cutting board", "butter knife", "person", "flour tortilla", "~12-inch strand of dental floss", "toothpicks"]
  var object_arr = []
  var im_width = 760
  var im_height = 428
  for (i = 0; i < objects_by_frame_arr_frames_being_stitched_conf_obj_label.length; i++){
    //for (i = 1; i < 2; i++){
    if (i > dst_index) {
      for (j = 0; j < objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values.length; j++){
        //get bounding box
        var bounding_box_texture_coords = objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].xyxyn

        //convert bounding box to pixel coords 
        var bounding_box = [bounding_box_texture_coords[0]*im_width, bounding_box_texture_coords[1]*im_height, bounding_box_texture_coords[2]*im_width, bounding_box_texture_coords[3]*im_height]

        //warp bounding box using translated homography matrix
        let lin_homg_pts = [[bounding_box[0], bounding_box[2]], [bounding_box[1], bounding_box[3]], [1, 1]]
        var trans_lin_homg_pts = [...Array(3)].map(e => Array(2));
        multiply(new_transf_list[i-1], lin_homg_pts, trans_lin_homg_pts)
        trans_lin_homg_pts = divide_array_by_last_row_32(trans_lin_homg_pts) 

        //convert warped pixel coords back into texture coords (using FULL PANORAMA WIDTH AND HEIGHT) 
        //apply scaleFactor
        //and store in vec3 format (x1 coord center, y1 coord center, index of obj label) and (x2 coord center, y2 coord center, index of obj label)
        object_arr.push({"x": (trans_lin_homg_pts[0][0]*scaleFactor) / pano_width, "y": 1 - ((trans_lin_homg_pts[1][0]*scaleFactor) / pano_height), "object_label": unique_obj_labels.indexOf(objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].label), "frame_index": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].frame_index, "confidence": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].confidence}) 
        object_arr.push({"x": (trans_lin_homg_pts[0][1]*scaleFactor) / pano_width, "y": 1 - ((trans_lin_homg_pts[1][1]*scaleFactor) / pano_height), "object_label": unique_obj_labels.indexOf(objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].label), "frame_index": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].frame_index, "confidence": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].confidence})
      }
    }else if (i < dst_index) {
        for (j = 0; j < objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values.length; j++){
          //get bounding box
          var bounding_box_texture_coords = objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].xyxyn
  
          //convert bounding box to pixel coords 
          var bounding_box = [bounding_box_texture_coords[0]*im_width, bounding_box_texture_coords[1]*im_height, bounding_box_texture_coords[2]*im_width, bounding_box_texture_coords[3]*im_height]
  
          //warp bounding box using translated homography matrix
          let lin_homg_pts = [[bounding_box[0], bounding_box[2]], [bounding_box[1], bounding_box[3]], [1, 1]]
          var trans_lin_homg_pts = [...Array(3)].map(e => Array(2));
          multiply(new_transf_list[i], lin_homg_pts, trans_lin_homg_pts)
          trans_lin_homg_pts = divide_array_by_last_row_32(trans_lin_homg_pts) 
  
          //convert warped pixel coords back into texture coords (using FULL PANORAMA WIDTH AND HEIGHT) 
          //apply scaleFactor
          //and store in vec3 format (x1 coord center, y1 coord center, index of obj label) and (x2 coord center, y2 coord center, index of obj label)
          object_arr.push({"x": (trans_lin_homg_pts[0][0]*scaleFactor) / pano_width, "y": 1 - ((trans_lin_homg_pts[1][0]*scaleFactor) / pano_height), "object_label": unique_obj_labels.indexOf(objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].label), "frame_index": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].frame_index, "confidence": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].confidence}) 
          object_arr.push({"x": (trans_lin_homg_pts[0][1]*scaleFactor) / pano_width, "y": 1 - ((trans_lin_homg_pts[1][1]*scaleFactor) / pano_height), "object_label": unique_obj_labels.indexOf(objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].label), "frame_index": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].frame_index, "confidence": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].confidence})
        }
      }else{
      for (j = 0; j < objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values.length; j++){
        //get bounding box
        var bounding_box_texture_coords = objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].xyxyn

        //convert bounding box to pixel coords 
        var bounding_box = [bounding_box_texture_coords[0]*im_width, bounding_box_texture_coords[1]*im_height, bounding_box_texture_coords[2]*im_width, bounding_box_texture_coords[3]*im_height]

        //warp bounding box using translated identity matrix (this is the base frame)
        var transf = [[1, 0, anchorX], [0, 1, anchorY], [0, 0, 1]]
        let lin_homg_pts = [[bounding_box[0], bounding_box[2]], [bounding_box[1], bounding_box[3]], [1, 1]]
        var trans_lin_homg_pts = [...Array(3)].map(e => Array(2));
        multiply(transf, lin_homg_pts, trans_lin_homg_pts)
        trans_lin_homg_pts = divide_array_by_last_row_32(trans_lin_homg_pts) 
                    
        //convert warped pixel coords back into texture coords (using FULL PANORAMA WIDTH AND HEIGHT) 
        //apply scaleFactor
        //and store in vec3 format (x1 coord center, y1 coord center, index of obj label) and (x2 coord center, y2 coord center, index of obj label)
        object_arr.push({"x": (trans_lin_homg_pts[0][0]*scaleFactor) / pano_width, "y": 1 - ((trans_lin_homg_pts[1][0]*scaleFactor) / pano_height), "object_label": unique_obj_labels.indexOf(objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].label), "frame_index": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].frame_index, "confidence": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].confidence}) 
        object_arr.push({"x": (trans_lin_homg_pts[0][1]*scaleFactor) / pano_width, "y": 1 - ((trans_lin_homg_pts[1][1]*scaleFactor) / pano_height), "object_label": unique_obj_labels.indexOf(objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].label), "frame_index": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].frame_index, "confidence": objects_by_frame_arr_frames_being_stitched_conf_obj_label[i].DETIC_data.values[j].confidence})
      }
    }
  }
  return object_arr
}

function get_arrows(object_vec4_arr){
  //for each obj_labels_checked
  let unique_obj_labels = ["Jar of nut butter", "Jar of jelly / jam", "plate", "paper towel", "cutting board", "butter knife", "person", "flour tortilla", "~12-inch strand of dental floss", "toothpicks"]
  var arrows_arr = []
  var obj_labels_checked = checkboxUpdateFunction()
  for (let i = 0; i < obj_labels_checked.length; i++){
      var obj_arrows_arr = []
      var single_arrows_arr = []
      let single_counter = obj_labels_checked.length + 1
      //get instances of that object label grouped by frame index
      var obj_instances_by_frame_ungrouped = object_vec4_arr.filter((el) => el.object_label == unique_obj_labels.indexOf(obj_labels_checked[i]));
      var obj_instances_by_frame = obj_instances_by_frame_ungrouped.groupBy("frame_index");
      
      for (let j = 0; j < obj_instances_by_frame.length; j++){
          //no duplicates in this frame, add center dot to arrow
          if (obj_instances_by_frame[j].groupList.length == 2){
              let prev_dot = {"x": (obj_instances_by_frame[j].groupList[0].x + obj_instances_by_frame[j].groupList[1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[0].y + obj_instances_by_frame[j].groupList[1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[0].object_label, "w": i}
              obj_arrows_arr.push(prev_dot)
          }
          //duplicates in first frame, just add first instance in group to object arrow and give the rest their own
          else if (obj_instances_by_frame[j].groupList.length > 2 && obj_arrows_arr.length == 0){
              let prev_dot = {"x": (obj_instances_by_frame[j].groupList[0].x + obj_instances_by_frame[j].groupList[1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[0].y + obj_instances_by_frame[j].groupList[1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[0].object_label, "w": i}
              obj_arrows_arr.push(prev_dot)
              for (let k = 2; k < obj_instances_by_frame[j].groupList.length; k += 2){
                  single_arrows_arr.push({"x": (obj_instances_by_frame[j].groupList[k].x + obj_instances_by_frame[j].groupList[k+1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[k].y + obj_instances_by_frame[j].groupList[k+1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[k].object_label, "w": single_counter})
                  single_counter += 1
              }
          }
          else if (obj_instances_by_frame[j].groupList.length > 2 && obj_arrows_arr.length != 0){
              let minDist = 10000000000000000000000000
              let prev_dot = obj_arrows_arr[obj_arrows_arr.length - 1]
              let closest_point_index = 0
              for (let k = 0; k < obj_instances_by_frame[j].groupList.length; k += 2){
                  let new_dot = [(obj_instances_by_frame[j].groupList[k].x + obj_instances_by_frame[j].groupList[k+1].x) / 2.0, (obj_instances_by_frame[j].groupList[k].y + obj_instances_by_frame[j].groupList[k+1].y) / 2.0]
                  let dist = getDistance(prev_dot.x, prev_dot.y, new_dot[0], new_dot[1])
                  if (dist < minDist){
                      minDist = dist
                      closest_point_index = k
                  }
              }
              //add closest point to arrow
              let new_prev_dot = {"x": (obj_instances_by_frame[j].groupList[closest_point_index].x + obj_instances_by_frame[j].groupList[closest_point_index+1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[closest_point_index].y + obj_instances_by_frame[j].groupList[closest_point_index+1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[closest_point_index].object_label, "w": i}
              obj_arrows_arr.push(new_prev_dot)

              //put rest in singles
              for (let k = 0; k < obj_instances_by_frame[j].groupList.length; k += 2){
                  if (k != closest_point_index){
                      single_arrows_arr.push({"x": (obj_instances_by_frame[j].groupList[k].x + obj_instances_by_frame[j].groupList[k+1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[k].y + obj_instances_by_frame[j].groupList[k+1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[k].object_label, "w": single_counter})
                      single_counter += 1
                  }
              }
          } 

      }

      if (obj_arrows_arr.length > 0){
          arrows_arr.push(obj_arrows_arr)
      }
      if (single_arrows_arr.length > 0){
          arrows_arr.push(single_arrows_arr)
      }
  }
  arrows_arr = arrows_arr.flat().sort((a, b) => parseFloat(a.w) - parseFloat(b.w)).reverse();
  return arrows_arr
}

/*
function get_arrows(object_vec4_arr){
  //for each obj_labels_checked
  let unique_obj_labels = ["Jar of nut butter", "Jar of jelly / jam", "plate", "paper towel", "cutting board", "butter knife", "person", "flour tortilla", "~12-inch strand of dental floss", "toothpicks"]
  var arrows_arr = []
  var obj_labels_checked = checkboxUpdateFunction()
  for (let i = 0; i < obj_labels_checked.length; i++){
      //var obj_arrows_arr = []
      //var single_arrows_arr = []
      //let single_counter = obj_labels_checked.length + 1
      //get instances of that object label grouped by frame index
      var obj_instances_by_frame_ungrouped = object_vec4_arr.filter((el) => el.object_label == unique_obj_labels.indexOf(obj_labels_checked[i]));
      var obj_instances_by_frame = obj_instances_by_frame_ungrouped.groupBy("frame_index");

      arrow_building_arr = [[], [], []]
      for (let j = 0; j < obj_instances_by_frame.length; j++){
          if (obj_instances_by_frame[j].groupList.length == 1){
            //if start
            if (arrow_building_arr[0].length == 0){
              let new_dot = {"x": (obj_instances_by_frame[j].groupList[0].x + obj_instances_by_frame[j].groupList[1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[0].y + obj_instances_by_frame[j].groupList[1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[0].object_label, "w": k}
              arrow_building_arr[0] = [new_dot]
            }
            else{
              let new_dot = {"x": (obj_instances_by_frame[j].groupList[0].x + obj_instances_by_frame[j].groupList[1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[0].y + obj_instances_by_frame[j].groupList[1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[0].object_label, "w": k}
              arrow_building_arr[0].push(new_dot)
            }
          }
          //for k instances, if 2-kth entries of arrow_building_arr == 0, add instance closest to existing arrow to that one and start new arrow(s) for others 
          else if (obj_instances_by_frame[j].groupList.length != 1){
            let arrow_count = 0
            for (let n = 0; n < arrow_building_arr.length; n++){
              if (arrow_building_arr[n].length != 0){
                arrow_count = arrow_count + 1
              }
            }
            //if start
            if (arrow_count == 0){
              let new_dot = {"x": (obj_instances_by_frame[j].groupList[0].x + obj_instances_by_frame[j].groupList[1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[0].y + obj_instances_by_frame[j].groupList[1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[0].object_label, "w": k}
              arrow_building_arr[0] = [new_dot]
              for (let k = 2; k < obj_instances_by_frame[j].groupList.length; k += 2){
                  arrow_building_arr[0] = {"x": (obj_instances_by_frame[j].groupList[k].x + obj_instances_by_frame[j].groupList[k+1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[k].y + obj_instances_by_frame[j].groupList[k+1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[k].object_label, "w": k}
              }
            }
            else if (arrow_count == 1){

            }
            else if (arrow_count == 2){

            }
            else if (arrow_count == 3){

            }
          }
      }




        if (j == 0){
          for (let k = 0; k < obj_instances_by_frame[j].groupList.length; k++){
            //w is arrow index for that obj in arrow_building_arr
            let new_dot = {"x": (obj_instances_by_frame[j].groupList[0].x + obj_instances_by_frame[j].groupList[1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[0].y + obj_instances_by_frame[j].groupList[1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[0].object_label, "w": k}
            arrow_building_arr[k] = [new_dot]
          }
        }
        else{
          if ()
        }

      }
      
      for (let j = 0; j < obj_instances_by_frame.length; j++){
          //no duplicates in this frame, add center dot to arrow
          if (obj_instances_by_frame[j].groupList.length == 2){
              let prev_dot = {"x": (obj_instances_by_frame[j].groupList[0].x + obj_instances_by_frame[j].groupList[1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[0].y + obj_instances_by_frame[j].groupList[1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[0].object_label, "w": i}
              obj_arrows_arr.push(prev_dot)
          }
          //duplicates in first frame, just add first instance in group to object arrow and give the rest their own
          else if (obj_instances_by_frame[j].groupList.length > 2 && obj_arrows_arr.length == 0){
              let prev_dot = {"x": (obj_instances_by_frame[j].groupList[0].x + obj_instances_by_frame[j].groupList[1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[0].y + obj_instances_by_frame[j].groupList[1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[0].object_label, "w": i}
              obj_arrows_arr.push(prev_dot)
              for (let k = 2; k < obj_instances_by_frame[j].groupList.length; k += 2){
                  single_arrows_arr.push({"x": (obj_instances_by_frame[j].groupList[k].x + obj_instances_by_frame[j].groupList[k+1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[k].y + obj_instances_by_frame[j].groupList[k+1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[k].object_label, "w": single_counter})
                  single_counter += 1
              }
          }
          else if (obj_instances_by_frame[j].groupList.length > 2 && obj_arrows_arr.length != 0){
              let minDist = 10000000000000000000000000
              let prev_dot = obj_arrows_arr[obj_arrows_arr.length - 1]
              let closest_point_index = 0
              for (let k = 0; k < obj_instances_by_frame[j].groupList.length; k += 2){
                  let new_dot = [(obj_instances_by_frame[j].groupList[k].x + obj_instances_by_frame[j].groupList[k+1].x) / 2.0, (obj_instances_by_frame[j].groupList[k].y + obj_instances_by_frame[j].groupList[k+1].y) / 2.0]
                  let dist = getDistance(prev_dot.x, prev_dot.y, new_dot[0], new_dot[1])
                  if (dist < minDist){
                      minDist = dist
                      closest_point_index = k
                  }
              }
              //add closest point to arrow
              let new_prev_dot = {"x": (obj_instances_by_frame[j].groupList[closest_point_index].x + obj_instances_by_frame[j].groupList[closest_point_index+1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[closest_point_index].y + obj_instances_by_frame[j].groupList[closest_point_index+1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[closest_point_index].object_label, "w": i}
              obj_arrows_arr.push(new_prev_dot)

              //put rest in singles
              for (let k = 0; k < obj_instances_by_frame[j].groupList.length; k += 2){
                  if (k != closest_point_index){
                      single_arrows_arr.push({"x": (obj_instances_by_frame[j].groupList[k].x + obj_instances_by_frame[j].groupList[k+1].x) / 2.0, "y": (obj_instances_by_frame[j].groupList[k].y + obj_instances_by_frame[j].groupList[k+1].y) / 2.0, "z": obj_instances_by_frame[j].groupList[k].object_label, "w": single_counter})
                      single_counter += 1
                  }
              }
          } 

      }

      if (obj_arrows_arr.length > 0){
          arrows_arr.push(obj_arrows_arr)
      }
      if (single_arrows_arr.length > 0){
          arrows_arr.push(single_arrows_arr)
      }
  }
  arrows_arr = arrows_arr.flat().sort((a, b) => parseFloat(a.w) - parseFloat(b.w)).reverse();
  return arrows_arr
}
*/

Array.prototype.groupBy = function(field){
	let groupedArr = [];
  this.forEach(function(e){
  	//look for an existent group
    let group = groupedArr.find(g => g['field'] === e[field]);
    if (group == undefined){
    	//add new group if it doesn't exist
      group = {field: e[field], groupList: []};
      groupedArr.push(group);
    }
    
    //add the element to the group
    group.groupList.push(e);
  });
  
  return groupedArr;
}

function getDistance(x1, y1, x2, y2){
  let x = x2 - x1;
  let y = y2 - y1;

  return Math.sqrt(x * x + y * y);
}

function get_euler_angles(R){
  let thetas = []
  let phis = []
  let sigs = []
  if (R[2][0] != 1 && R[2][0] != -1){
    let theta_1 = -Math.asin(R[2][0])
    let theta_2 = Math.PI - theta_1
    let phi_1 = Math.atan2((R[2][0] / Math.cos(theta_1)), (R[2][2] / Math.cos(theta_1)))
    let phi_2 = Math.atan2((R[2][0] / Math.cos(theta_2)), (R[2][2] / Math.cos(theta_2)))
    let sig_1 = Math.atan2((R[1][0] / Math.cos(theta_1)), (R[0][0] / Math.cos(theta_1)))
    let sig_2 = Math.atan2((R[1][0] / Math.cos(theta_2)), (R[0][0] / Math.cos(theta_2)))
    thetas.push(theta_1)
    thetas.push(theta_2)
    phis.push(phi_1)
    phis.push(phi_2)
    sigs.push(sig_1)
    sigs.push(sig_2)
  }
  else{
    let sig = 0
    sigs.push(sig)
    if (R[2][0] != -1){
      let theta = Math.PI / 2
      let phi = sig + Math.atan2(R[0][1], R[0][2])
      thetas.push(theta)
      phis.push(phi)
    }
    else{
      let theta = -Math.PI / 2
      let phi = -sig + Math.atan2(-R[0][1], -R[0][2])
      thetas.push(theta)
      phis.push(phi)
    }
  }
  return [thetas, phis, sigs]
}

//kmeans ref: https://medium.com/geekculture/implementing-k-means-clustering-from-scratch-in-javascript-13d71fbcb31e

function randomBetween(min, max) {
  return Math.floor(
    Math.random() * (max - min) + min
  );
}

function calcMeanCentroid(dataSet, start, end) {
  const features = dataSet[0].length;
  const n = end - start;
  let mean = [];
  for (let i = 0; i < features; i++) {
    mean.push(0);
  }
  for (let i = start; i < end; i++) {
    for (let j = 0; j < features; j++) {
      mean[j] = mean[j] + dataSet[i][j] / n;
    }
  }
  return mean;
}

function getRandomCentroidsNaiveSharding(dataset, k) {
  // implementation of a variation of naive sharding centroid initialization method
  // (not using sums or sorting, just dividing into k shards and calc mean)
  // https://www.kdnuggets.com/2017/03/naive-sharding-centroid-initialization-method.html
  const numSamples = dataset.length;
  // Divide dataset into k shards:
  const step = Math.floor(numSamples / k);
  const centroids = [];
  for (let i = 0; i < k; i++) {
    const start = step * i;
    let end = step * (i + 1);
    if (i + 1 === k) {
      end = numSamples;
    }
    centroids.push(calcMeanCentroid(dataset, start, end));
  }
  return centroids;
}

function getRandomCentroids(dataset, k) {
  // selects random points as centroids from the dataset
  const numSamples = dataset.length;
  const centroidsIndex = [];
  let index;
  while (centroidsIndex.length < k) {
    index = randomBetween(0, numSamples);
    if (centroidsIndex.indexOf(index) === -1) {
      centroidsIndex.push(index);
    }
  }
  const centroids = [];
  for (let i = 0; i < centroidsIndex.length; i++) {
    const centroid = [...dataset[centroidsIndex[i]]];
    centroids.push(centroid);
  }
  return centroids;
}

function compareCentroids(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function shouldStop(oldCentroids, centroids, iterations, MAX_ITERATIONS) {
  if (iterations > MAX_ITERATIONS) {
    return true;
  }
  if (!oldCentroids || !oldCentroids.length) {
    return false;
  }
  let sameCount = true;
  for (let i = 0; i < centroids.length; i++) {
    if (!compareCentroids(centroids[i], oldCentroids[i])) {
      sameCount = false;
    }
  }
  return sameCount;
}

// Calculate Squared Euclidean Distance
function getDistanceSQ(a, b) {
  const diffs = [];
  for (let i = 0; i < a.length; i++) {
    diffs.push(a[i] - b[i]);
  }
  return diffs.reduce((r, e) => (r + (e * e)), 0);
}

// Returns a label for each piece of data in the dataset. 
function getLabels(dataSet, centroids) {
  // prep data structure:
  const labels = {};
  for (let c = 0; c < centroids.length; c++) {
    labels[c] = {
      points: [],
      centroid: centroids[c],
    };
  }
  // For each element in the dataset, choose the closest centroid. 
  // Make that centroid the element's label.
  for (let i = 0; i < dataSet.length; i++) {
    const a = dataSet[i];
    let closestCentroid, closestCentroidIndex, prevDistance;
    for (let j = 0; j < centroids.length; j++) {
      let centroid = centroids[j];
      if (j === 0) {
        closestCentroid = centroid;
        closestCentroidIndex = j;
        prevDistance = getDistanceSQ(a, closestCentroid);
      } else {
        // get distance:
        const distance = getDistanceSQ(a, centroid);
        if (distance < prevDistance) {
          prevDistance = distance;
          closestCentroid = centroid;
          closestCentroidIndex = j;
        }
      }
    }
    // add point to centroid labels:
    labels[closestCentroidIndex].points.push(a);
  }
  return labels;
}

function getPointsMean(pointList) {
  const totalPoints = pointList.length;
  const means = [];
  for (let j = 0; j < pointList[0].length; j++) {
    means.push(0);
  }
  for (let i = 0; i < pointList.length; i++) {
    const point = pointList[i];
    for (let j = 0; j < point.length; j++) {
      const val = point[j];
      means[j] = means[j] + val / totalPoints;
    }
  }
  return means;
}

function recalculateCentroids(dataSet, labels, k) {
  // Each centroid is the geometric mean of the points that
  // have that centroid's label. Important: If a centroid is empty (no points have
  // that centroid's label) you should randomly re-initialize it.
  let newCentroid;
  const newCentroidList = [];
  for (const k in labels) {
    const centroidGroup = labels[k];
    if (centroidGroup.points.length > 0) {
      // find mean:
      newCentroid = getPointsMean(centroidGroup.points);
    } else {
      // get new random centroid
      newCentroid = getRandomCentroids(dataSet, 1)[0];
    }
    newCentroidList.push(newCentroid);
  }
  return newCentroidList;
}

function kmeans(dataset, k, MAX_ITERATIONS, useNaiveSharding = true) {
  if (dataset.length && dataset[0].length && dataset.length > k) {
    // Initialize book keeping variables
    let iterations = 0;
    let oldCentroids, labels, centroids;

    // Initialize centroids randomly
    if (useNaiveSharding) {
      centroids = getRandomCentroidsNaiveSharding(dataset, k);
    } else {
      centroids = getRandomCentroids(dataset, k);
    }

    // Run the main k-means algorithm
    while (!shouldStop(oldCentroids, centroids, iterations, MAX_ITERATIONS)) {
      // Save old centroids for convergence test.
      oldCentroids = [...centroids];
      iterations++;

      // Assign labels to each datapoint based on centroids
      labels = getLabels(dataset, centroids);
      centroids = recalculateCentroids(dataset, labels, k);
    }

    const clusters = [];
    for (let i = 0; i < k; i++) {
      clusters.push(labels[i]);
    }
    const results = {
      clusters: clusters,
      centroids: centroids,
      iterations: iterations,
      converged: iterations <= MAX_ITERATIONS,
    };
    return results;
  } else {
    throw new Error('Invalid dataset');
  }
}
//end kmeans ref

function homography_filtering(homography_matrices_arr){
  //multiply by camera matrix + camera matrix inverse
  let k = [[1047.76377, 0, 959.261205], [0, 1051.17493, 529.115465], [0, 0, 1]]
  let k_inv = [[0.000954413607, 0, -0.915531947], [0, 0.000951316445, -0.503356243], [0, 0, 1]]
  let euclidean_homography_matrices_arr = []

  for (let i = 0; i < homography_matrices_arr.length; i++){
    var intermediate_multiply = [...Array(3)].map(e => Array(3));
    var euclidean_H = [...Array(3)].map(e => Array(3));
    var current_homography = [[homography_matrices_arr[i].data64F[0], homography_matrices_arr[i].data64F[1], homography_matrices_arr[i].data64F[2]], [homography_matrices_arr[i].data64F[3], homography_matrices_arr[i].data64F[4], homography_matrices_arr[i].data64F[5]], [homography_matrices_arr[i].data64F[6], homography_matrices_arr[i].data64F[7], homography_matrices_arr[i].data64F[8]]];
    multiply(k_inv, current_homography, intermediate_multiply)
    multiply(intermediate_multiply, k, euclidean_H)
    euclidean_homography_matrices_arr.push(euclidean_H)
  }

  //svd
  let singular_values_arr = []
  for (let i = 0; i < euclidean_homography_matrices_arr.length; i++){
    const { u, v, q } = SVDJS.SVD(euclidean_homography_matrices_arr[i])
    singular_values_arr.push(q)
  }
  
  //singular values for dst
  let q_dist = [1.0, 1.0, 1.0]
  
  //return homography_matrices_arr
  return [singular_values_arr, q_dst]
}

//stitch frames (depends on startidx, endidx, dstidx, kp detector, skip size, lowes threshold, RANSAC threshold, cluster thresholding on/off)
function stitch_frames(){

  //get frames to stitch and assign base frame
  var startFrameIdx = document.getElementById("startFrame").value - 1;
  console.log("startFrameIdx")
  console.log(startFrameIdx)
  var endFrameIdx = document.getElementById("endFrame").value - 1;
  console.log("endFrameIdx")
  console.log(endFrameIdx)
  var skip_size = parseInt(document.getElementById("dropout").value);
  console.log("skip_size")
  console.log(skip_size)
  let all_frame_indices = Array.from({ length: frames_arr.length }, (value, index) => index);
  console.log("all_frame_indices:")
  console.log(all_frame_indices)
  //stitching_frames = all_frame_indices.filter((index) => index >= startFrameIdx && index <= endFrameIdx && (index - startFrameIdx)%skip_size == 0);

  //EDITING
  
  stitching_frames = [4, 3, 2, 1, 0]
  //stitching_frames = [10, 5]

  console.log("Frames being stitched:")
  console.log(stitching_frames)

  var numFramesDisplay = document.getElementById("numFrames");
  numFramesDisplay.innerHTML = stitching_frames.length;

  let dst_index = stitching_frames[0];
  //let dst_index = parseInt(Math.floor((endFrameIdx - startFrameIdx)/2)); 
  //dst_index = parseInt(stitching_frames[Math.floor(stitching_frames.length / 2)]); 
  console.log("dst_index:")
  console.log(dst_index)

  //compute original dst/base frame corners 
  let dst = frames_arr[dst_index];
  let gray_src_im_arr = frames_arr.filter((item, index) => {return stitching_frames.includes(index) && index != dst_index;})
  var dst_width = dst.size().width; //760
  var dst_height = dst.size().height; //428
  console.log("dst_width")
  console.log(dst_width)
  console.log("dst_height")
  console.log(dst_height)

  console.log("length gray_src_im_arr")
  console.log(gray_src_im_arr.length)

  //create feature detector
  var featureDetectorName = parseInt(document.getElementById("keypoint-detectors").value);
  console.log(featureDetectorName)
  var detect = new cv.BRISK();

  if (featureDetectorName == 1){
      console.log("IN BRISK");
      detect = new cv.BRISK();
      console.log("EXITING BRISK");
  }

  if (featureDetectorName == 2){
      detect = new cv.ORB();
  }
  
  if (featureDetectorName == 3){
      detect = new cv.KAZE();
  }
  
  if (featureDetectorName == 4){
      detect = new cv.AKAZE();
  }

  if (featureDetectorName == 5){
     detect = new cv.BRISK();
  }


  //variables to store keypoints and descriptors
  let dst_keypoints = new cv.KeyPointVector();
  let dst_descriptors = new cv.Mat();
  detect.detectAndCompute(dst, new cv.Mat(), dst_keypoints, dst_descriptors);

  let src_keypoint_arr = []
  let src_descriptor_arr = []
  for (let i = 0; i < gray_src_im_arr.length; i++){
      let src_keypoints = new cv.KeyPointVector();
      let src_descriptors = new cv.Mat();
      detect.detectAndCompute(gray_src_im_arr[i], new cv.Mat(), src_keypoints, src_descriptors);
      src_keypoint_arr.push(src_keypoints)
      src_descriptor_arr.push(src_descriptors)
  }
  console.log("KEYPOINTS AND DESCRIPTORS COMPUTED")
  //LIMIT # OF KPS AND DESCS to MAKE MATCHING FASTER????

  //for each src image, match features with dst + determine "good" matches by Lowe's ratio test
  let good_matches_arr = []
  for (let j = 0; j < gray_src_im_arr.length; j++){
      let good_matches = new cv.DMatchVector();
      let bf = new cv.BFMatcher();
      //let bf = new cv.BFMatcher(cv.NORM_HAMMING);
      let matches = new cv.DMatchVectorVector();

      bf.knnMatch(src_descriptor_arr[j], dst_descriptors, matches, 2);

      let lowesRatio = document.getElementById("lowes").value;
      //let knnDistance_option = 0.7;
      let counter = 0;
      for (let i = 0; i < matches.size(); ++i) {
          let match = matches.get(i);
          let dMatch1 = match.get(0);
          let dMatch2 = match.get(1);
          if (dMatch1.distance <= dMatch2.distance * parseFloat(lowesRatio)) {
              good_matches.push_back(dMatch1);
              counter++;
          }
      }
      good_matches_arr.push(good_matches);
  }

  console.log("good matches detected")

  //get location of good matches for each src frame/dst pair
  let good_match_location_mats = []
  for (let j = 0; j < good_matches_arr.length; j++){
      let point_src = [];
      let points_dst = [];
      for (let i = 0; i < good_matches_arr[j].size(); i++) {
          point_src.push(src_keypoint_arr[j].get(good_matches_arr[j].get(i).queryIdx ).pt.x );
          point_src.push(src_keypoint_arr[j].get(good_matches_arr[j].get(i).queryIdx ).pt.y );
          points_dst.push(dst_keypoints.get(good_matches_arr[j].get(i).trainIdx ).pt.x );
          points_dst.push(dst_keypoints.get(good_matches_arr[j].get(i).trainIdx ).pt.y );
      }

      var mat_src = new cv.Mat(point_src.length,1,cv.CV_32FC2);
      mat_src.data32F.set(point_src);

      var mat_dst = new cv.Mat(points_dst.length,1,cv.CV_32FC2);
      mat_dst.data32F.set(points_dst);

      good_match_location_mats.push([mat_src, mat_dst])
  }

  console.log("good match locations found")

  //find homography matrices
  let homography_matrices_arr = []
  let RANSACReprojectionThreshold = document.getElementById("ransac").value;
  for (let i = 0; i < good_match_location_mats.length; i++){
      let h = cv.findHomography(good_match_location_mats[i][0], good_match_location_mats[i][1], cv.RANSAC, parseFloat(RANSACReprojectionThreshold));
      //parseFloat(RANSACReprojectionThreshold)
      homography_matrices_arr.push(h)
  }

  console.log("homography matrices computed")

  //adjust homography matrix by anchorX and anchorY
  let minMaxXY_arr = []
  var src_width = gray_src_im_arr[0].size().width; //760
  var src_height = gray_src_im_arr[0].size().height; //428

  for (let i = 0; i < gray_src_im_arr.length; i++){
      let lin_homg_pts = [[0, src_width, src_width, 0], [0, 0, src_height, src_height], [1, 1, 1, 1]]
      let transf = [[homography_matrices_arr[i].data64F[0], homography_matrices_arr[i].data64F[1], homography_matrices_arr[i].data64F[2]], [homography_matrices_arr[i].data64F[3], homography_matrices_arr[i].data64F[4], homography_matrices_arr[i].data64F[5]], [homography_matrices_arr[i].data64F[6], homography_matrices_arr[i].data64F[7], homography_matrices_arr[i].data64F[8]]]
      console.log("transf")
      console.log(transf)
      var trans_lin_homg_pts = [...Array(3)].map(e => Array(4));
      multiply(transf, lin_homg_pts, trans_lin_homg_pts)
      trans_lin_homg_pts = divide_array_by_last_row(trans_lin_homg_pts) 

      let minXhm = Math.min(...trans_lin_homg_pts[0])
      let maxXhm = Math.max(...trans_lin_homg_pts[0])
      let minYhm = Math.min(...trans_lin_homg_pts[1])
      let maxYhm = Math.max(...trans_lin_homg_pts[1])
      minMaxXY_arr.push([minXhm, minYhm, maxXhm, maxYhm])
  }

  //calculate the needed padding 
  const arrayColumn = (arr, n) => arr.map(x => x[n]);
  let overallMinY = Math.min(...arrayColumn(minMaxXY_arr, 1))
  let overallMinX = Math.min(...arrayColumn(minMaxXY_arr, 0))

  //add translation to ALL transformation matrices to shift to positive values
  let new_transf_list = []
  let anchorX = 0
  let anchorY = 0
  let transl_transf = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  if (overallMinX < 0){
      anchorX = parseInt(Math.round(-overallMinX))
      transl_transf[0][2] = anchorX
  }
  if (overallMinY < 0){
      anchorY = parseInt(Math.round(-overallMinY))
      transl_transf[1][2] = anchorY
  }

  for (let i = 0; i < homography_matrices_arr.length; i++){
      let transf = [[homography_matrices_arr[i].data64F[0], homography_matrices_arr[i].data64F[1], homography_matrices_arr[i].data64F[2]], [homography_matrices_arr[i].data64F[3], homography_matrices_arr[i].data64F[4], homography_matrices_arr[i].data64F[5]], [homography_matrices_arr[i].data64F[6], homography_matrices_arr[i].data64F[7], homography_matrices_arr[i].data64F[8]]]
      var new_transf = [...Array(3)].map(e => Array(3));
      multiply(transl_transf, transf, new_transf)
      new_transf = divide_array_by_bottom_right_corner(new_transf) 
      new_transf_list.push(new_transf)
  }

  console.log("translated homography matrices computed")

  //compute each src frame corners WITHOUT opencv and store corners 
  var computedCoords = {}
  computedCoords[0] = {'frame_id': stitching_frames[0], 'corner_1_x': anchorX, 'corner_1_y': anchorY, 'corner_2_x': dst_width + anchorX, 'corner_2_y': anchorY, 'corner_3_x': dst_width + anchorX, 'corner_3_y': dst_height + anchorY, 'corner_4_x': anchorX, 'corner_4_y': dst_height + anchorY}
  
  for (let i = 0; i < new_transf_list.length; i++){
      var src_lin_homg_pts = [[0, src_width, src_width, 0], [0, 0, src_height, src_height], [1, 1, 1, 1]]
      var src_trans_lin_homg_pts = [...Array(3)].map(e => Array(4));
      multiply(new_transf_list[i], src_lin_homg_pts, src_trans_lin_homg_pts)
      src_trans_lin_homg_pts = divide_array_by_last_row(src_trans_lin_homg_pts)
      computedCoords[i+1] = {'frame_id': stitching_frames[i+1], 'corner_1_x': Math.round(src_trans_lin_homg_pts[0][0]), 'corner_1_y': Math.round(src_trans_lin_homg_pts[1][0]), 'corner_2_x': Math.round(src_trans_lin_homg_pts[0][1]), 'corner_2_y': Math.round(src_trans_lin_homg_pts[1][1]), 'corner_3_x': Math.round(src_trans_lin_homg_pts[0][2]), 'corner_3_y': Math.round(src_trans_lin_homg_pts[1][2]), 'corner_4_x': Math.round(src_trans_lin_homg_pts[0][3]), 'corner_4_y': Math.round(src_trans_lin_homg_pts[1][3])}
  }
 
  console.log("corners computed")

  //scale everything down (in proportion) so it fits next to the controls
  panoCanvasWidth = document.getElementById("canvas-pano").offsetWidth;
  panoCanvasHeight = document.getElementById("canvas-pano").offsetHeight;
  let xSize = panoCanvasWidth*0.99
  let ySize = panoCanvasHeight*0.99
  let xFrameMin = panoCanvasWidth*0.99
  let xFrameMax = 0
  let yFrameMin = panoCanvasHeight*0.99
  let yFrameMax = 0
  let entries = arrayColumn(Object.entries(computedCoords), 1)
  for (let  i = 0; i < entries.length; i++){
      let x_vals = entries.map(function (el) {return [el.corner_1_x, el.corner_2_x, el.corner_3_x, el.corner_4_x]}).flat()
      let xRowMin = Math.min(...x_vals)
      let xRowMax = Math.max(...x_vals)
      if (xRowMin < xFrameMin){
          xFrameMin = xRowMin
      }
      if (xRowMax > xFrameMax){
          xFrameMax = xRowMax
      }
      let y_vals = entries.map(function (el) {return [el.corner_1_y, el.corner_2_y, el.corner_3_y, el.corner_4_y]}).flat()
      let yRowMin = Math.min(...y_vals)
      let yRowMax = Math.max(...y_vals)
      if (yRowMin < yFrameMin){
          yFrameMin = yRowMin
      }
      if (yRowMax > yFrameMax){
          yFrameMax = yRowMax
      }
  }
  let pano_width = xFrameMax - xFrameMin
  let pano_height = yFrameMax - yFrameMin
  let scaleFactor = Math.min((xSize / (xFrameMax - xFrameMin)), (ySize / (yFrameMax - yFrameMin)))

  for (let i = 0; i < Object.keys(computedCoords).length; i++){
      let scaledDownCorners = {"frame_id": computedCoords[i].frame_id, "corner_1_x": Math.round(computedCoords[i].corner_1_x * scaleFactor), "corner_1_y": Math.round(computedCoords[i].corner_1_y * scaleFactor), "corner_2_x": Math.round(computedCoords[i].corner_2_x * scaleFactor), "corner_2_y": Math.round(computedCoords[i].corner_2_y * scaleFactor), "corner_3_x": Math.round(computedCoords[i].corner_3_x * scaleFactor), "corner_3_y": Math.round(computedCoords[i].corner_3_y * scaleFactor), "corner_4_x": Math.round(computedCoords[i].corner_4_x * scaleFactor), "corner_4_y": Math.round(computedCoords[i].corner_4_y * scaleFactor)}
      computedCoords[i] = scaledDownCorners
  }

  console.log("corners scaled")

  console.log("computedCoords:")
  console.log(computedCoords)

  console.log("pano_width, pano_height, scaleFactor, anchorX, anchorY")
  console.log(pano_width, pano_height, scaleFactor, anchorX, anchorY)

  //new_transf_list_log = [[[new_transf_list[0].data64F[0], new_transf_list[0].data64F[1], new_transf_list[0].data64F[2]], [new_transf_list[0].data64F[3], new_transf_list[0].data64F[4], new_transf_list[0].data64F[5]], [new_transf_list[0].data64F[6], new_transf_list[0].data64F[7], new_transf_list[0].data64F[8]]], [[new_transf_list[1].data64F[0], new_transf_list[1].data64F[1], new_transf_list[1].data64F[2]], [new_transf_list[1].data64F[3], new_transf_list[1].data64F[4], new_transf_list[1].data64F[5]], [new_transf_list[1].data64F[6], new_transf_list[1].data64F[7], new_transf_list[1].data64F[8]]]]
  
  console.log("new_transf_list")
  console.log(new_transf_list)

  return [computedCoords, pano_width, pano_height, scaleFactor, anchorX, anchorY, new_transf_list, stitching_frames]
}

//stitch frames (depends on startidx, endidx, dstidx, kp detector, skip size, lowes threshold, RANSAC threshold, cluster thresholding on/off)
function stitch_frames_sequential(){

  //get frames to stitch and assign base frame
  var startFrameIdx = document.getElementById("startFrame").value - 1;
  console.log("startFrameIdx")
  console.log(startFrameIdx)
  var endFrameIdx = document.getElementById("endFrame").value - 1;
  console.log("endFrameIdx")
  console.log(endFrameIdx)
  var skip_size = parseInt(document.getElementById("dropout").value);
  console.log("skip_size")
  console.log(skip_size)
  let all_frame_indices = Array.from({ length: frames_arr.length }, (value, index) => index);
  console.log("all_frame_indices:")
  console.log(all_frame_indices)
  //stitching_frames = all_frame_indices.filter((index) => index >= startFrameIdx && index <= endFrameIdx && (index - startFrameIdx)%skip_size == 0);
  
  stitching_frames = [4, 3, 2, 1, 0]

  console.log("Frames being stitched:")
  console.log(stitching_frames)

  var numFramesDisplay = document.getElementById("numFrames");
  numFramesDisplay.innerHTML = stitching_frames.length;

  //compute original dst/base frame corners 
  let dst = frames_arr[stitching_frames[0]];
  let gray_src_im_arr = frames_arr.filter((item, index) => {return stitching_frames.includes(index) && index != dst_index;})
  var dst_width = dst.size().width; //760
  var dst_height = dst.size().height; //428
  console.log("dst_width")
  console.log(dst_width)
  console.log("dst_height")
  console.log(dst_height)

  console.log("length gray_src_im_arr")
  console.log(gray_src_im_arr.length)

  //create feature detector
  var featureDetectorName = parseInt(document.getElementById("keypoint-detectors").value);
  console.log(featureDetectorName)
  var detect = new cv.BRISK();

  if (featureDetectorName == 1){
      console.log("IN BRISK");
      detect = new cv.BRISK();
      console.log("EXITING BRISK");
  }

  if (featureDetectorName == 2){
      detect = new cv.ORB();
  }
  
  if (featureDetectorName == 3){
      detect = new cv.KAZE();
  }
  
  if (featureDetectorName == 4){
      detect = new cv.AKAZE();
  }

  //variables to store keypoints and descriptors
  let dst_keypoints = new cv.KeyPointVector();
  let dst_descriptors = new cv.Mat();
  detect.detectAndCompute(dst, new cv.Mat(), dst_keypoints, dst_descriptors);

  let src_keypoint_arr = []
  let src_descriptor_arr = []
  for (let i = 0; i < gray_src_im_arr.length; i++){
      let src_keypoints = new cv.KeyPointVector();
      let src_descriptors = new cv.Mat();
      detect.detectAndCompute(gray_src_im_arr[i], new cv.Mat(), src_keypoints, src_descriptors);
      src_keypoint_arr.push(src_keypoints)
      src_descriptor_arr.push(src_descriptors)
  }
  console.log("KEYPOINTS AND DESCRIPTORS COMPUTED")
  //LIMIT # OF KPS AND DESCS to MAKE MATCHING FASTER????

  //for each src image, match features with dst + determine "good" matches by Lowe's ratio test
  let good_matches_arr = []
  for (let j = 0; j < gray_src_im_arr.length; j++){
      let good_matches = new cv.DMatchVector();
      let bf = new cv.BFMatcher();
      //let bf = new cv.BFMatcher(cv.NORM_HAMMING);
      let matches = new cv.DMatchVectorVector();

      bf.knnMatch(src_descriptor_arr[j], dst_descriptors, matches, 2);

      let lowesRatio = document.getElementById("lowes").value;
      //let knnDistance_option = 0.7;
      let counter = 0;
      for (let i = 0; i < matches.size(); ++i) {
          let match = matches.get(i);
          let dMatch1 = match.get(0);
          let dMatch2 = match.get(1);
          if (dMatch1.distance <= dMatch2.distance * parseFloat(lowesRatio)) {
              good_matches.push_back(dMatch1);
              counter++;
          }
      }
      good_matches_arr.push(good_matches);
  }

  console.log("good matches detected")

  //get location of good matches for each src frame/dst pair
  let good_match_location_mats = []
  for (let j = 0; j < good_matches_arr.length; j++){
      let point_src = [];
      let points_dst = [];
      for (let i = 0; i < good_matches_arr[j].size(); i++) {
          point_src.push(src_keypoint_arr[j].get(good_matches_arr[j].get(i).queryIdx ).pt.x );
          point_src.push(src_keypoint_arr[j].get(good_matches_arr[j].get(i).queryIdx ).pt.y );
          points_dst.push(dst_keypoints.get(good_matches_arr[j].get(i).trainIdx ).pt.x );
          points_dst.push(dst_keypoints.get(good_matches_arr[j].get(i).trainIdx ).pt.y );
      }

      var mat_src = new cv.Mat(point_src.length,1,cv.CV_32FC2);
      mat_src.data32F.set(point_src);

      var mat_dst = new cv.Mat(points_dst.length,1,cv.CV_32FC2);
      mat_dst.data32F.set(points_dst);

      good_match_location_mats.push([mat_src, mat_dst])
  }

  console.log("good match locations found")

  //find homography matrices
  let homography_matrices_arr = []
  let RANSACReprojectionThreshold = document.getElementById("ransac").value;
  for (let i = 0; i < good_match_location_mats.length; i++){
      let h = cv.findHomography(good_match_location_mats[i][0], good_match_location_mats[i][1], cv.RANSAC, parseFloat(RANSACReprojectionThreshold));
      //parseFloat(RANSACReprojectionThreshold)
      homography_matrices_arr.push(h)
  }

  console.log("homography matrices computed")


  //adjust homography matrix by anchorX and anchorY
  let minMaxXY_arr = []
  var src_width = gray_src_im_arr[0].size().width; //760
  var src_height = gray_src_im_arr[0].size().height; //428

  for (let i = 0; i < gray_src_im_arr.length; i++){
      let lin_homg_pts = [[0, src_width, src_width, 0], [0, 0, src_height, src_height], [1, 1, 1, 1]]
      let transf = [[homography_matrices_arr[i].data64F[0], homography_matrices_arr[i].data64F[1], homography_matrices_arr[i].data64F[2]], [homography_matrices_arr[i].data64F[3], homography_matrices_arr[i].data64F[4], homography_matrices_arr[i].data64F[5]], [homography_matrices_arr[i].data64F[6], homography_matrices_arr[i].data64F[7], homography_matrices_arr[i].data64F[8]]]
      console.log("transf")
      console.log(transf)
      var trans_lin_homg_pts = [...Array(3)].map(e => Array(4));
      multiply(transf, lin_homg_pts, trans_lin_homg_pts)
      trans_lin_homg_pts = divide_array_by_last_row(trans_lin_homg_pts) 

      let minXhm = Math.min(...trans_lin_homg_pts[0])
      let maxXhm = Math.max(...trans_lin_homg_pts[0])
      let minYhm = Math.min(...trans_lin_homg_pts[1])
      let maxYhm = Math.max(...trans_lin_homg_pts[1])
      minMaxXY_arr.push([minXhm, minYhm, maxXhm, maxYhm])
  }

  //calculate the needed padding 
  const arrayColumn = (arr, n) => arr.map(x => x[n]);
  let overallMinY = Math.min(...arrayColumn(minMaxXY_arr, 1))
  let overallMinX = Math.min(...arrayColumn(minMaxXY_arr, 0))

  //add translation to ALL transformation matrices to shift to positive values
  let new_transf_list = []
  let anchorX = 0
  let anchorY = 0
  let transl_transf = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  if (overallMinX < 0){
      anchorX = parseInt(Math.round(-overallMinX))
      transl_transf[0][2] = anchorX
  }
  if (overallMinY < 0){
      anchorY = parseInt(Math.round(-overallMinY))
      transl_transf[1][2] = anchorY
  }

  for (let i = 0; i < homography_matrices_arr.length; i++){
      let transf = [[homography_matrices_arr[i].data64F[0], homography_matrices_arr[i].data64F[1], homography_matrices_arr[i].data64F[2]], [homography_matrices_arr[i].data64F[3], homography_matrices_arr[i].data64F[4], homography_matrices_arr[i].data64F[5]], [homography_matrices_arr[i].data64F[6], homography_matrices_arr[i].data64F[7], homography_matrices_arr[i].data64F[8]]]
      var new_transf = [...Array(3)].map(e => Array(3));
      multiply(transl_transf, transf, new_transf)
      new_transf = divide_array_by_bottom_right_corner(new_transf) 
      new_transf_list.push(new_transf)
  }

  console.log("translated homography matrices computed")

  //compute each src frame corners WITHOUT opencv and store corners 
  var computedCoords = {}
  computedCoords[0] = {'frame_id': stitching_frames[0], 'corner_1_x': anchorX, 'corner_1_y': anchorY, 'corner_2_x': dst_width + anchorX, 'corner_2_y': anchorY, 'corner_3_x': dst_width + anchorX, 'corner_3_y': dst_height + anchorY, 'corner_4_x': anchorX, 'corner_4_y': dst_height + anchorY}
  
  for (let i = 0; i < new_transf_list.length; i++){
      var src_lin_homg_pts = [[0, src_width, src_width, 0], [0, 0, src_height, src_height], [1, 1, 1, 1]]
      var src_trans_lin_homg_pts = [...Array(3)].map(e => Array(4));
      multiply(new_transf_list[i], src_lin_homg_pts, src_trans_lin_homg_pts)
      src_trans_lin_homg_pts = divide_array_by_last_row(src_trans_lin_homg_pts)
      computedCoords[i+1] = {'frame_id': stitching_frames[i+1], 'corner_1_x': Math.round(src_trans_lin_homg_pts[0][0]), 'corner_1_y': Math.round(src_trans_lin_homg_pts[1][0]), 'corner_2_x': Math.round(src_trans_lin_homg_pts[0][1]), 'corner_2_y': Math.round(src_trans_lin_homg_pts[1][1]), 'corner_3_x': Math.round(src_trans_lin_homg_pts[0][2]), 'corner_3_y': Math.round(src_trans_lin_homg_pts[1][2]), 'corner_4_x': Math.round(src_trans_lin_homg_pts[0][3]), 'corner_4_y': Math.round(src_trans_lin_homg_pts[1][3])}
  }

  console.log("corners computed")

  //scale everything down (in proportion) so it fits next to the controls
  let xSize = 700
  let ySize = 700
  let xFrameMin = 700
  let xFrameMax = 0
  let yFrameMin = 700
  let yFrameMax = 0
  let entries = arrayColumn(Object.entries(computedCoords), 1)
  for (let  i = 0; i < entries.length; i++){
      let x_vals = entries.map(function (el) {return [el.corner_1_x, el.corner_2_x, el.corner_3_x, el.corner_4_x]}).flat()
      let xRowMin = Math.min(...x_vals)
      let xRowMax = Math.max(...x_vals)
      if (xRowMin < xFrameMin){
          xFrameMin = xRowMin
      }
      if (xRowMax > xFrameMax){
          xFrameMax = xRowMax
      }
      let y_vals = entries.map(function (el) {return [el.corner_1_y, el.corner_2_y, el.corner_3_y, el.corner_4_y]}).flat()
      let yRowMin = Math.min(...y_vals)
      let yRowMax = Math.max(...y_vals)
      if (yRowMin < yFrameMin){
          yFrameMin = yRowMin
      }
      if (yRowMax > yFrameMax){
          yFrameMax = yRowMax
      }
  }
  let pano_width = xFrameMax - xFrameMin
  let pano_height = yFrameMax - yFrameMin
  let scaleFactor = Math.min((xSize / (xFrameMax - xFrameMin)), (ySize / (yFrameMax - yFrameMin)))

  for (let i = 0; i < Object.keys(computedCoords).length; i++){
      let scaledDownCorners = {"frame_id": computedCoords[i].frame_id, "corner_1_x": Math.round(computedCoords[i].corner_1_x * scaleFactor), "corner_1_y": Math.round(computedCoords[i].corner_1_y * scaleFactor), "corner_2_x": Math.round(computedCoords[i].corner_2_x * scaleFactor), "corner_2_y": Math.round(computedCoords[i].corner_2_y * scaleFactor), "corner_3_x": Math.round(computedCoords[i].corner_3_x * scaleFactor), "corner_3_y": Math.round(computedCoords[i].corner_3_y * scaleFactor), "corner_4_x": Math.round(computedCoords[i].corner_4_x * scaleFactor), "corner_4_y": Math.round(computedCoords[i].corner_4_y * scaleFactor)}
      computedCoords[i] = scaledDownCorners
  }

  console.log("corners scaled")

  console.log("computedCoords:")
  console.log(computedCoords)

  console.log("pano_width, pano_height, scaleFactor, anchorX, anchorY")
  console.log(pano_width, pano_height, scaleFactor, anchorX, anchorY)

  //new_transf_list_log = [[[new_transf_list[0].data64F[0], new_transf_list[0].data64F[1], new_transf_list[0].data64F[2]], [new_transf_list[0].data64F[3], new_transf_list[0].data64F[4], new_transf_list[0].data64F[5]], [new_transf_list[0].data64F[6], new_transf_list[0].data64F[7], new_transf_list[0].data64F[8]]], [[new_transf_list[1].data64F[0], new_transf_list[1].data64F[1], new_transf_list[1].data64F[2]], [new_transf_list[1].data64F[3], new_transf_list[1].data64F[4], new_transf_list[1].data64F[5]], [new_transf_list[1].data64F[6], new_transf_list[1].data64F[7], new_transf_list[1].data64F[8]]]]
  
  console.log("new_transf_list")
  console.log(new_transf_list)

  return [computedCoords, pano_width, pano_height, scaleFactor, anchorX, anchorY, new_transf_list, stitching_frames]
}

function get_centroids(img_idx, masks){

  let centroids = [];

  for (let i = 0; i < masks[img_idx]["frame_masks"].length; i++) {
    if (masks[img_idx]["frame_masks"][i]["box"].length != 0){
      let x1 = masks[img_idx]["frame_masks"][i]["box"][0][0];
      let y1 = masks[img_idx]["frame_masks"][i]["box"][0][1];
      let x2 = masks[img_idx]["frame_masks"][i]["box"][0][2];
      let y2 = masks[img_idx]["frame_masks"][i]["box"][0][3];

      let centroidx = parseInt(x1 + ((x2 - x1) / 2.0));
      let centroidy = parseInt(y1 + ((y2 - y1) / 2.0));

      centroids.push({"text_prompt": masks[img_idx]["frame_masks"][i]["text_prompt"], "centroid": [centroidx, centroidy]});
    }
  }

  return centroids
}

function warp_point(x, y, M){
  let d = M[2][0] * x + M[2][1] * y + M[2][2]; 

  return [parseInt((M[0][0] * x + M[0][1] * y + M[0][2]) / d), parseInt((M[1][0] * x + M[1][1] * y + M[1][2]) / d)]
}

function get_num_mask(boolean_mask, frame_idx){
  let num_mask = []
  for (let i = 0; i < boolean_mask.length; i++) {
    let num_mask_inner = []
    for (let j = 0; j < boolean_mask[0].length; j++) {
      if (boolean_mask[i][j] == true){
        num_mask_inner.push([frame_idx+1, frame_idx+1, frame_idx+1])
      }
      else{
        num_mask_inner.push([0.0, 0.0, 0.0])
      }
    }
    num_mask.push(num_mask_inner)
  }
  //num_mask = np.array(num_mask)

  return [num_mask, frame_idx+1]
}

function mask_images(jsonMasksForStitchedIndices, new_transf_list, anchorX, anchorY){
  let base_hm = [[1.0, 0.0, anchorX], [0.0, 1.0, anchorY], [0.0, 0.0, 1.0]]
  let warped_centroids_by_obj = {}
  for (let i = 0; i < jsonMasksForStitchedIndices.length; i++) {
    for (let j = 0; j < jsonMasksForStitchedIndices[i]["centroids"].length; j++) {
      let frame_idx = jsonMasksForStitchedIndices[i]["frame_index"];
      let object_label = jsonMasksForStitchedIndices[i]["centroids"][j]["text_prompt"];
      let centroidx = jsonMasksForStitchedIndices[i]["centroids"][j]["centroid"][0];
      let centroidy = jsonMasksForStitchedIndices[i]["centroids"][j]["centroid"][1];
      let hm = [];
      if (i == 0){
        hm = base_hm;
      }
      else{
        hm = new_transf_list[i - 1];
      }

      let warpedCentroid = warp_point(centroidx, centroidy, hm);

      if (Object.keys(warped_centroids_by_obj).includes(object_label)){
        warped_centroids_by_obj[object_label].push({"frame": frame_idx, "warped_centroid": [warpedCentroid[0], warpedCentroid[1]]});
      }
      else{
        warped_centroids_by_obj[object_label] = [{"frame": frame_idx, "warped_centroid": [warpedCentroid[0], warpedCentroid[1]]}];
      }
    }
  }
  console.log("warped_centroids_by_obj:")
  console.log(warped_centroids_by_obj)

  function getDistance( x1, y1, x2, y2 ) {
	
    var 	xs = x2 - x1,
      ys = y2 - y1;		
    
    xs *= xs;
    ys *= ys;
     
    return Math.sqrt( xs + ys );
  };

  let precedent_frames_by_obj = {};
  let dist_threshold = 50;
  let keys = Object.keys(warped_centroids_by_obj);
  console.log("keys")
  console.log(keys)
  for (let i = 0; i < keys.length; i++) {
    if (warped_centroids_by_obj[keys[i]].length > 1){
      let first_frame_centroid = warped_centroids_by_obj[keys[i]][0]["warped_centroid"];
      let last_frame_centroid = warped_centroids_by_obj[keys[i]][warped_centroids_by_obj[keys[i]].length - 1]["warped_centroid"];
      let dist = getDistance(first_frame_centroid, last_frame_centroid);
      if (dist >= dist_threshold){
        precedent_frames_by_obj[keys[i]] = warped_centroids_by_obj[keys[i]][warped_centroids_by_obj[keys[i]].length - 1]["frame"];
      }
      else{
        precedent_frames_by_obj[keys[i]] = warped_centroids_by_obj[keys[i]][0]["frame"];
      }
    }
    else{
      precedent_frames_by_obj[keys[i]] = warped_centroids_by_obj[keys[i]][0]["frame"];
    }
  }

  console.log("precedent_frames_by_obj")
  console.log(precedent_frames_by_obj)

  return [precedent_frames_by_obj, keys]
}

Array.prototype.matrixSum = function(a) {
  return this.reduce((p,c,i) => (p[i] = c.reduce((f,s,j) => (f[j]+= s,f),p[i]),p),a.slice());
};

function masks_to_alphaMaps(jsonMasksForStitchedIndices, precedent_frames_by_obj_and_keys){
  let alphaMaps = [];
  let alphaMap = [];
  let precedentAlphaMaps = [];
  let precedentAlphaMap = [];
  let precedent_frames_by_obj = precedent_frames_by_obj_and_keys[0];
  let keys = precedent_frames_by_obj_and_keys[1];
  let whiteArray = Array(428).fill().map(() => Array(760).fill().map(() => Array(4).fill(255.0)));
  let blackArray = Array(428).fill().map(() => Array(760).fill().map(() => Array(4).fill(0.0)));
  console.log("jsonMasksForStitchedIndices")
  console.log(jsonMasksForStitchedIndices)

  //for each frame
  for (let i = 0; i < jsonMasksForStitchedIndices.length; i++) {
    let frame_index = jsonMasksForStitchedIndices[i]["frame_index"];
    let masks_sum = [];
    let precedent_masks_sum = [];
    //for each obj
    for (let j = 0; j < jsonMasksForStitchedIndices[i]["frame_masks"].length; j++) {
      //if non-precedent for that obj, convert mask true => 255, false => 0 and add to running sum
      if (frame_index != precedent_frames_by_obj[jsonMasksForStitchedIndices[i]["frame_masks"][j]["text_prompt"]]){
        let next_mask = jsonMasksForStitchedIndices[i]["frame_masks"][j]["mask"];
        if (next_mask.length > 0){
          next_mask = next_mask[0].map( function( row ) {
            return row.map( function( cell ) { 
              if(cell == true){return 255}else{return 0}; 
            } );
          } )
          masks_sum = masks_sum.matrixSum(next_mask);
        }
      }
      else if (frame_index == precedent_frames_by_obj[jsonMasksForStitchedIndices[i]["frame_masks"][j]["text_prompt"]]){
        let next_mask = jsonMasksForStitchedIndices[i]["frame_masks"][j]["mask"];
        if (next_mask.length > 0){
          next_mask = next_mask[0].map( function( row ) {
            return row.map( function( cell ) { 
              if(cell == true){return 255}else{return 0}; 
            } );
          } )
          precedent_masks_sum = precedent_masks_sum.matrixSum(next_mask);
        }
      }
    }
    //invert the non precedent maps
    if (masks_sum.length > 0){
      alphaMap = masks_sum.map( function( row ) {
        return row.map( function( cell ) { 
          if(cell > 0){return [0.0, 0.0, 0.0, 0.0]}else{return [255.0, 255.0, 255.0, 255.0]}; } );
      } )
    }
    else{
      alphaMap = whiteArray;
    }

    if (precedent_masks_sum.length > 0){
      precedentAlphaMap = precedent_masks_sum.map( function( row ) {
        return row.map( function( cell ) { 
          if(cell > 0){return [255.0, 255.0, 255.0, 255.0]}else{return [0.0, 0.0, 0.0, 0.0] }; } );
      } )
    }
    else{
      precedentAlphaMap = blackArray;
    }

    alphaMap = alphaMap.map(row=>row).reverse().flat(Infinity)
    precedentAlphaMap = precedentAlphaMap.map(row=>row).reverse().flat(Infinity)

    const width = 760;
    const height = 428;

    const size = width * height;
    const data = new Uint8Array( 4 * size );
    const pdata = new Uint8Array( 4 * size );

    for ( let i = 0; i < size; i ++ ) {
      const stride = i * 4;
      data[ stride ] = alphaMap[ stride ];
      data[ stride + 1 ] = alphaMap[ stride + 1 ];
      data[ stride + 2 ] = alphaMap[ stride + 2 ];
      data[ stride + 3 ] = 255;
      pdata[ stride ] = precedentAlphaMap[ stride ];
      pdata[ stride + 1 ] = precedentAlphaMap[ stride + 1 ];
      pdata[ stride + 2 ] = precedentAlphaMap[ stride + 2 ];
      pdata[ stride + 3 ] = 255;
    }

    // used the buffer to create a DataTexture
    const texture = new THREE.DataTexture( data, width, height );
    texture.needsUpdate = true;
    const ptexture = new THREE.DataTexture( pdata, width, height );
    ptexture.needsUpdate = true;


    alphaMaps.push({"frame": frame_index, "texture": texture});
    precedentAlphaMaps.push({"frame": frame_index, "texture": ptexture})

  }

  console.log("alphaMaps");
  console.log(alphaMaps);

  return [alphaMaps, precedentAlphaMaps]

}

function load_im_to_tex(computedCoords, jsonMasksForStitchedIndices, precedent_frames_by_obj_and_keys){
  var tex = [];
  var texAlphaMaps = [];
  var coordsX = [];
  var coordsY = [];
  var frameID = {};
  var counter = 0;

  var alphaMaps = masks_to_alphaMaps(jsonMasksForStitchedIndices, precedent_frames_by_obj_and_keys);
  console.log("LOOK HERE")
  console.log(alphaMaps)

  Object.entries(computedCoords).forEach((entry) => {
      const [key, value] = entry;
      coordsX[key] = [ 
          value.corner_1_x,
          value.corner_2_x,
          value.corner_3_x,
          value.corner_4_x ];
      coordsY[key] = [ 
          value.corner_1_y,
          value.corner_2_y,
          value.corner_3_y,
          value.corner_4_y ];
      frameID[key] = counter;
      tex[key] = new THREE.TextureLoader().load( file_path + (parseInt(value.frame_id)).toString() + '.png' );
      texAlphaMaps[key] = alphaMaps[0].filter(obj => {return obj["frame"] === parseInt(value.frame_id)})[0]["texture"];
      //new THREE.TextureLoader().load( 'test_alpha_map.png' );
    counter = counter + 1;
  });

  console.log(coordsX)
  console.log(coordsY)

  // get min/max x/y values
  var minX = Math.min(...coordsX.map(item => Math.min.apply(null, item)));
  var maxX = Math.max(...coordsX.map(item => Math.max.apply(null, item)));
  var minY = Math.min(...coordsY.map(item => Math.min.apply(null, item)));
  var maxY = Math.max(...coordsY.map(item => Math.max.apply(null, item)));

  coordsX[tex.length] = [minX, maxX, maxX, minX];
  coordsY[tex.length] = [minY, minY, maxY, maxY];
  frameID[tex.length] = tex.length + 1;
  tex[tex.length] = new THREE.TextureLoader().load( 'transparent.png' );

  //add completely black (transparent) map for transparent top layer
  let blackArray = Array(428).fill().map(() => Array(760).fill().map(() => Array(3).fill(0.0)));
  texAlphaMaps[texAlphaMaps.length] = new THREE.TextureLoader().load( 'transparent.png' );
  //new THREE.DataTexture( blackArray, 760, 428 );

  var imageCount = tex.length;
  console.log(imageCount)
  console.log("texAlphaMaps length")
  console.log(texAlphaMaps.length)

  console.log("textures loaded")

  //update highlight slider
  var sliderframe = document.getElementById("highlightFrame");
  sliderframe.max = imageCount - 1

  console.log("minX, maxX, minY, maxY:")
  console.log(minX, maxX, minY, maxY)

  return [coordsX, coordsY, frameID, tex, minX, maxX, minY, maxY, imageCount, texAlphaMaps]
}

function init_obj_processing_case_study(){
  //var obj_times = jsonDETIC.map(function (el) { return parseInt(el.timestamp.slice(0, -2)); }); //timestamps are in MILLIseconds
  
  //match DETIC outputs to frames by timestamp
  var objects_by_frame_arr = []
  var start_time = 0
  var frame_increment = 10
  var obj_counter = 0
  for (var i = 0; i < total_frames; i++) {
    obj_counter = obj_counter + jsonDETIC[i].values.length
    objects_by_frame_arr.push({"frame_index": i, "timestamp": start_time + (i/frame_increment), "DETIC_index": i, "DETIC_data": jsonDETIC[i]})
  }

  ///get unique object labels for one-hot encoding
  var unique_obj_labels = Array.from(new Set(objects_by_frame_arr.map(function (el) { return el.DETIC_data.values; }).map(function (el) { return el.map(function (el) { return el.label; }) }).flat()));

  console.log("objects_by_frame_arr")
  console.log(objects_by_frame_arr)
  console.log("TOTAL NUMBER OF OBJS IN SCENE:")
  console.log(obj_counter)

  return [objects_by_frame_arr, unique_obj_labels]
}

function init_obj_processing(){
  var obj_times = jsonDETIC.map(function (el) { return parseInt(el.timestamp.slice(0, -2)); }); //timestamps are in MILLIseconds
  
  //match DETIC outputs to frames by timestamp
  var objects_by_frame_arr = []
  var start_time = obj_times[0]
  var frame_increment = 15
  for (var i = 0; i < total_frames; i++) {
    var frame_timestamp = start_time+(((1/frame_increment)*1000)*i)
    var closest_time = 10000000000000000000000000
    for (var j = 0; j < obj_times.length; j++) {
      if (Math.abs(obj_times[j] - frame_timestamp) <= Math.abs(closest_time - frame_timestamp)){
        closest_time = obj_times[j]
      }
    }
    var closest_time_index = obj_times.indexOf(closest_time)
    objects_by_frame_arr.push({"frame_index": i, "timestamp": frame_timestamp, "DETIC_index": closest_time_index, "DETIC_data": jsonDETIC[closest_time_index]})
  }

  ///get unique object labels for one-hot encoding
  var unique_obj_labels = Array.from(new Set(objects_by_frame_arr.map(function (el) { return el.DETIC_data.values; }).map(function (el) { return el.map(function (el) { return el.label; }) }).flat()));

  return [objects_by_frame_arr, unique_obj_labels]
}

function filter_objs_by_frame_and_warp(anchorX, anchorY, scaleFactor, pano_width, pano_height, new_transf_list){
  
  //var frames_being_stitched = [196, 187, 178]
  var objects_by_frame_arr_frames_being_stitched = filter_frames_being_stitched()
  console.log("objects_by_frame_arr_frames_being_stitched")
  console.log(objects_by_frame_arr_frames_being_stitched)

  //warp object_data_arr onto panorama given new_transf_list, scaleFactor, and index of base frame (apply new_transf AND scale to fit 1000x1000, check that these haven't been normalized yet) 
  //we're assuming first index is base frame and that each frame is 760x428
  var object_arr = warp_to_panorama(objects_by_frame_arr_frames_being_stitched, anchorX, anchorY, scaleFactor, pano_width, pano_height, new_transf_list)

  return object_arr
}

function add_ticks_to_slider_case_study(){
  //get annotations for SLIDER (separate from panorama)
  obj_data_0 = obj_data[0]
  unique_obj_labels = ["Jar of nut butter", "Jar of jelly / jam", "plate", "paper towel", "cutting board", "butter knife", "person", "flour tortilla", "~12-inch strand of dental floss", "toothpicks"]

  //match frame idxs to DETIC outputs (first frame corresponding to output)
  var jsonDETICWithFrames = JSON.parse(JSON.stringify(jsonDETIC));
  jsonDETICWithFrames[0]["frame_idx"] = obj_data_0[0].frame_index
  let prev_DETIC_idx = 0
  let jsonDETICWithFramesIndex = 1
  for (let i = 0; i < obj_data_0.length; i++){
    current_DETIC_idx = obj_data_0[i].DETIC_index
    if (current_DETIC_idx != prev_DETIC_idx){
      jsonDETICWithFrames[jsonDETICWithFramesIndex]["frame_idx"] = obj_data_0[i].frame_index
      jsonDETICWithFramesIndex = jsonDETICWithFramesIndex + 1
      prev_DETIC_idx = obj_data_0[i].DETIC_index
    }
  }

  var intermediate_obj_annotations = jsonDETICWithFrames.map(function (el) { return {"frame_idx": el.frame_idx, "labels": el.values.map(function (el) { return el.label;})}; })

  var counts_by_DETIC_output = []
  for (const el of intermediate_obj_annotations){
      var counts = {};
      var labels = el.labels
      for (const num of labels) {
          counts[num] = counts[num] ? counts[num] + 1 : 1;
      }
      counts_by_DETIC_output.push({"frame_idx": el.frame_idx,"counts": counts})
  }

  //get duplicates
  var duplicate_objs = []
  for (const el of counts_by_DETIC_output){
      var counts = el.counts
      var count_keys = Object.keys(el.counts)
      var duplicates = []
      for (const key of count_keys){
          if (counts[key] != 1){
              duplicates.push(key)
          }
      }
      if (duplicates.length > 0){
          duplicate_objs.push({"frame_idx": el.frame_idx,"objects_with_duplicates": duplicates})
      }
  }
  //var duplicate_objs = JSON.parse(JSON.stringify(counts_by_DETIC_output));
  //duplicate_objs = duplicate_objs.map(function (el) { return {"frame_idx": el.frame_idx, "duplicate_counts": Object.keys(el.counts)}});
  //Object.keys(el.counts).forEach(key => {if (el.counts[key] == 1) delete el.counts[key]})
  //duplicate_objs = duplicate_objs.map(function (el) { if(el.duplicate_counts != null){return el.frame_idx} });

  var duplicate_objs_frames_arr = JSON.parse(JSON.stringify(duplicate_objs));
  duplicate_objs_frames_arr = duplicate_objs_frames_arr.map(function (el) { return el.frame_idx});

  //get first time new objects are seen
  var seen_arr = []
  var new_objs = []
  for (const el of counts_by_DETIC_output){
      var objects = Object.keys(el.counts)
      const found = objects.filter(x => !seen_arr.includes(x))
      if (found.length > 0){
          new_objs.push({"frame_idx": el.frame_idx, "new_objs": found})
          for (const obj of found){
              seen_arr.push(obj)
          }
      }
  }
  var new_objs_frames_arr = JSON.parse(JSON.stringify(new_objs));
  new_objs_frames_arr = new_objs_frames_arr.map(function (el) { return el.frame_idx});

  //get times when objects are removed because they haven't been seen in x frames (10 as default)
  var memory_window = 10
  var memory_removed = []
  var unique_obj_labels = ["Jar of nut butter", "Jar of jelly / jam", "plate", "paper towel", "cutting board", "butter knife", "person", "flour tortilla", "~12-inch strand of dental floss", "toothpicks"]
  unique_obj_labels = unique_obj_labels.map(function (el) { return el.new_objs}).flat();

  //needs to be initialized for all of them. If something is present in a row, it gets set to 0. If not, it gets incremented. If incrementing it brings it to memory_window, put the frame_idx and label into memory_removed  
  var memory_counts = {}
  for (var i = 0; i < unique_obj_labels.length; i++){
      memory_counts[unique_obj_labels[i]] = -1
  }
  for (var i = 0; i < counts_by_DETIC_output.length; i++){
      var removed = []
      var objects = Object.keys(counts_by_DETIC_output[i].counts)
      for (const obj of unique_obj_labels){
          if (objects.includes(obj)){
              memory_counts[obj] = 0
          }
          else if (memory_counts[obj] != -1){
              memory_counts[obj] = memory_counts[obj] + 1
              if (memory_counts[obj] == memory_window){
                  removed.push(obj)
              }
          }
      }
      if (removed.length > 0){
          memory_removed.push({"frame_idx": counts_by_DETIC_output[i].frame_idx, "removed_objs": removed})
      }
  }
  var memory_removed_frames_arr = JSON.parse(JSON.stringify(memory_removed));
  memory_removed_frames_arr = memory_removed_frames_arr.map(function (el) { return el.frame_idx});

  //add ticks
  total_frames_slider = obj_data_0.length
  append_ticks(duplicate_objs_frames_arr, total_frames_slider, "duplicates") //duplicate_objs_frames_arr //[13, 45, 73] //tick_frames[0] //[13, 18]
  append_ticks(new_objs_frames_arr, total_frames_slider, "new_objects") //new_objs_frames_arr //tick_frames[1] //[5, 8, 10]
  append_ticks(memory_removed_frames_arr, total_frames_slider, "removed_from_memory") //tick_frames[2] //[15, 20]
}

function add_ticks_to_slider_exp_int(jsonDETIC){
  //get annotations for SLIDER (separate from panorama)
  obj_data_0 = obj_data[0]
  unique_obj_labels = ["Jar of nut butter", "Jar of jelly / jam", "plate", "paper towel", "cutting board", "butter knife", "person", "flour tortilla", "~12-inch strand of dental floss", "toothpicks"]

  //match frame idxs to DETIC outputs (first frame corresponding to output)
  var jsonDETICWithFrames = jsonDETIC;
  jsonDETICWithFrames[0]["frame_idx"] = obj_data_0[0].frame_index
  let prev_DETIC_idx = 0
  let jsonDETICWithFramesIndex = 1
  for (let i = 0; i < obj_data_0.length; i++){
    current_DETIC_idx = obj_data_0[i].DETIC_index
    if (current_DETIC_idx != prev_DETIC_idx){
      jsonDETICWithFrames[jsonDETICWithFramesIndex]["frame_idx"] = obj_data_0[i].frame_index
      jsonDETICWithFramesIndex = jsonDETICWithFramesIndex + 1
      prev_DETIC_idx = obj_data_0[i].DETIC_index
    }
  }


  var intermediate_obj_annotations = jsonDETICWithFrames.map(function (el) { return {"frame_idx": el.frame_idx, "labels": el.values.map(function (el) { return el.label;})}; })

  var counts_by_DETIC_output = []
  for (const el of intermediate_obj_annotations){
      var counts = {};
      var labels = el.labels
      for (const num of labels) {
          counts[num] = counts[num] ? counts[num] + 1 : 1;
      }
      counts_by_DETIC_output.push({"frame_idx": el.frame_idx,"counts": counts})
  }

  //get duplicates
  var duplicate_objs = []
  for (const el of counts_by_DETIC_output){
      var counts = el.counts
      var count_keys = Object.keys(el.counts)
      var duplicates = []
      for (const key of count_keys){
          if (counts[key] != 1){
              duplicates.push(key)
          }
      }
      if (duplicates.length > 0){
          duplicate_objs.push({"frame_idx": el.frame_idx,"objects_with_duplicates": duplicates})
      }
  }
  //var duplicate_objs = JSON.parse(JSON.stringify(counts_by_DETIC_output));
  //duplicate_objs = duplicate_objs.map(function (el) { return {"frame_idx": el.frame_idx, "duplicate_counts": Object.keys(el.counts)}});
  //Object.keys(el.counts).forEach(key => {if (el.counts[key] == 1) delete el.counts[key]})
  //duplicate_objs = duplicate_objs.map(function (el) { if(el.duplicate_counts != null){return el.frame_idx} });

  var duplicate_objs_frames_arr = JSON.parse(JSON.stringify(duplicate_objs));
  duplicate_objs_frames_arr = duplicate_objs_frames_arr.map(function (el) { return el.frame_idx});

  //get first time new objects are seen
  var seen_arr = []
  var new_objs = []
  for (const el of counts_by_DETIC_output){
      var objects = Object.keys(el.counts)
      const found = objects.filter(x => !seen_arr.includes(x))
      if (found.length > 0){
          new_objs.push({"frame_idx": el.frame_idx, "new_objs": found})
          for (const obj of found){
              seen_arr.push(obj)
          }
      }
  }
  var new_objs_frames_arr = JSON.parse(JSON.stringify(new_objs));
  new_objs_frames_arr = new_objs_frames_arr.map(function (el) { return el.frame_idx});

  //get times when objects are removed because they haven't been seen in x frames (10 as default)
  var memory_window = 10
  var memory_removed = []
  var unique_obj_labels = ["Jar of nut butter", "Jar of jelly / jam", "plate", "paper towel", "cutting board", "butter knife", "person", "flour tortilla", "~12-inch strand of dental floss", "toothpicks"]
  unique_obj_labels = unique_obj_labels.map(function (el) { return el.new_objs}).flat();

  //needs to be initialized for all of them. If something is present in a row, it gets set to 0. If not, it gets incremented. If incrementing it brings it to memory_window, put the frame_idx and label into memory_removed  
  var memory_counts = {}
  for (var i = 0; i < unique_obj_labels.length; i++){
      memory_counts[unique_obj_labels[i]] = -1
  }
  for (var i = 0; i < counts_by_DETIC_output.length; i++){
      var removed = []
      var objects = Object.keys(counts_by_DETIC_output[i].counts)
      for (const obj of unique_obj_labels){
          if (objects.includes(obj)){
              memory_counts[obj] = 0
          }
          else if (memory_counts[obj] != -1){
              memory_counts[obj] = memory_counts[obj] + 1
              if (memory_counts[obj] == memory_window){
                  removed.push(obj)
              }
          }
      }
      if (removed.length > 0){
          memory_removed.push({"frame_idx": counts_by_DETIC_output[i].frame_idx, "removed_objs": removed})
      }
  }
  var memory_removed_frames_arr = JSON.parse(JSON.stringify(memory_removed));
  memory_removed_frames_arr = memory_removed_frames_arr.map(function (el) { return el.frame_idx});

  //add ticks
  total_frames_slider = obj_data_0.length
  console.log("LOOK HERE SLIDER")
  console.log(new_objs_frames_arr)
  append_ticks([1, 9, 16, 24, 50, 59, 70, 82, 88, 97], 100, "duplicates", ["person(3)", "cutting_board(2)", "person(3)", "person(3)", "cutting_board(3),_flour_tortilla(3),_person(3)", "flour_tortilla(2)", "butter_knife(2)", "person(3)", "person(2),_butter_knife(2)", "person(3)"]) //duplicate_objs_frames_arr //[13, 45, 73] //tick_frames[0] //[13, 18]
  append_ticks([0, 8, 58], 100, "new_objects", ['cutting_board,_flour_tortilla,_person,_Jar_of_nut_butter,_Jar_of_jelly/jam,_plate,_butter_knife', '~12-inch_strand_of_dental_floss', 'toothpicks,_paper_towel']) //new_objs_frames_arr //tick_frames[1] //[5, 8, 10]
  //append_ticks([50, 70], 100, "removed_from_memory") //tick_frames[2] //[15, 20]
}

function add_ticks_to_slider(){
  //get annotations for SLIDER (separate from panorama)
  obj_data_0 = obj_data[0]
  unique_obj_labels = ["Jar of nut butter", "Jar of jelly / jam", "plate", "paper towel", "cutting board", "butter knife", "person", "flour tortilla", "~12-inch strand of dental floss", "toothpicks"]

  //match frame idxs to DETIC outputs (first frame corresponding to output)
  var jsonDETICWithFrames = JSON.parse(JSON.stringify(jsonDETIC));
  jsonDETICWithFrames[0]["frame_idx"] = obj_data_0[0].frame_index
  let prev_DETIC_idx = 0
  let jsonDETICWithFramesIndex = 1
  for (let i = 0; i < obj_data_0.length; i++){
    current_DETIC_idx = obj_data_0[i].DETIC_index
    if (current_DETIC_idx != prev_DETIC_idx){
      jsonDETICWithFrames[jsonDETICWithFramesIndex]["frame_idx"] = obj_data_0[i].frame_index
      jsonDETICWithFramesIndex = jsonDETICWithFramesIndex + 1
      prev_DETIC_idx = obj_data_0[i].DETIC_index
    }
  }

  var intermediate_obj_annotations = jsonDETICWithFrames.map(function (el) { return {"frame_idx": el.frame_idx, "labels": el.values.map(function (el) { return el.label;})}; })

  var counts_by_DETIC_output = []
  for (const el of intermediate_obj_annotations){
      var counts = {};
      var labels = el.labels
      for (const num of labels) {
          counts[num] = counts[num] ? counts[num] + 1 : 1;
      }
      counts_by_DETIC_output.push({"frame_idx": el.frame_idx,"counts": counts})
  }

  //get duplicates
  var duplicate_objs = []
  for (const el of counts_by_DETIC_output){
      var counts = el.counts
      var count_keys = Object.keys(el.counts)
      var duplicates = []
      for (const key of count_keys){
          if (counts[key] != 1){
              duplicates.push(key)
          }
      }
      if (duplicates.length > 0){
          duplicate_objs.push({"frame_idx": el.frame_idx,"objects_with_duplicates": duplicates})
      }
  }

  var duplicate_objs_frames_arr = JSON.parse(JSON.stringify(duplicate_objs));
  duplicate_objs_frames_arr = duplicate_objs_frames_arr.map(function (el) { return el.frame_idx});

  //get first time new objects are seen
  var seen_arr = []
  var new_objs = []
  for (const el of counts_by_DETIC_output){
      var objects = Object.keys(el.counts)
      const found = objects.filter(x => !seen_arr.includes(x))
      if (found.length > 0){
          new_objs.push({"frame_idx": el.frame_idx, "new_objs": found})
          for (const obj of found){
              seen_arr.push(obj)
          }
      }
  }
  var new_objs_frames_arr = JSON.parse(JSON.stringify(new_objs));
  new_objs_frames_arr = new_objs_frames_arr.map(function (el) { return el.frame_idx});

  //get times when objects are removed because they haven't been seen in x frames (10 as default)
  var memory_window = 10
  var memory_removed = []
  var unique_obj_labels = ["Jar of nut butter", "Jar of jelly / jam", "plate", "paper towel", "cutting board", "butter knife", "person", "flour tortilla", "~12-inch strand of dental floss", "toothpicks"]
  unique_obj_labels = unique_obj_labels.map(function (el) { return el.new_objs}).flat();

  //needs to be initialized for all of them. If something is present in a row, it gets set to 0. If not, it gets incremented. If incrementing it brings it to memory_window, put the frame_idx and label into memory_removed  
  var memory_counts = {}
  for (var i = 0; i < unique_obj_labels.length; i++){
      memory_counts[unique_obj_labels[i]] = -1
  }
  for (var i = 0; i < counts_by_DETIC_output.length; i++){
      var removed = []
      var objects = Object.keys(counts_by_DETIC_output[i].counts)
      for (const obj of unique_obj_labels){
          if (objects.includes(obj)){
              memory_counts[obj] = 0
          }
          else if (memory_counts[obj] != -1){
              memory_counts[obj] = memory_counts[obj] + 1
              if (memory_counts[obj] == memory_window){
                  removed.push(obj)
              }
          }
      }
      if (removed.length > 0){
          memory_removed.push({"frame_idx": counts_by_DETIC_output[i].frame_idx, "removed_objs": removed})
      }
  }
  var memory_removed_frames_arr = JSON.parse(JSON.stringify(memory_removed));
  memory_removed_frames_arr = memory_removed_frames_arr.map(function (el) { return el.frame_idx});

  //add ticks
  total_frames_slider = obj_data_0.length
  append_ticks(duplicate_objs_frames_arr, total_frames_slider, "duplicates") //duplicate_objs_frames_arr //[13, 45, 73] //tick_frames[0] //[13, 18]
  append_ticks(new_objs_frames_arr, total_frames_slider, "new_objects") //new_objs_frames_arr //tick_frames[1] //[5, 8, 10]
  append_ticks(memory_removed_frames_arr, total_frames_slider, "removed_from_memory") //tick_frames[2] //[15, 20]
}

function init(maxX, minX, maxY, minY, imageCount, coordsX, coordsY, tex, object_vec4_arr_padded, arrows_arr_padded, obj_array_length, arrows_array_length, texAlphaMaps) {

  // WebGL renderer update
  renderer = new THREE.WebGLRenderer( { preserveDrawingBuffer: true } );
  renderer.autoClear = false;
  renderer.setClearColor( 0xffffff, 1.0 );
  container = document.getElementById( 'canvas-pano' );
  container.appendChild( renderer.domElement );

  // Create two render targets for ping-pong rendering
  setupRenderTargets(maxX, minX, maxY, minY);

  // Our scene
  setupScene(minX, maxX, minY, maxY, imageCount, coordsX, coordsY, tex, object_vec4_arr_padded, arrows_arr_padded, obj_array_length, arrows_array_length, texAlphaMaps);

  // Setup rendering step for fullscreen quad rendering (show render target texture)
  setupFullscreenQuadRendering(fsScene, fsCamera, fsMaterial);

  // resize render targets
  for (var i = 0; i < target.length; i++) {
      target[i].setSize( maxX - minX, maxY - minY );
  }
  // set renderer size to image size
  renderer.setSize( (maxX - minX) / 1.0, (maxY - minY) / 1.0 );
}

function setupRenderTargets(maxX, minX, maxY, minY) {
  // dispose of all previously declared render targets
  if (target.length != 0){
    for (var i = 0; i < target.length; i++) {
        if ( target[i] ) target[i].dispose();
    }
  }

  // first render target
  target[0] = new THREE.WebGLRenderTarget( maxX - minX, maxY - minY );
  target[0].texture.minFilter = THREE.LinearFilter;
  target[0].texture.magFilter = THREE.LinearFilter;

  // second render target
  target[1] = new THREE.WebGLRenderTarget( maxX - minX, maxY - minY );
  target[1].texture.minFilter = THREE.LinearFilter;
  target[1].texture.magFilter = THREE.LinearFilter;
}

function setupFullscreenQuadRendering() {
  // renders a texture on a full-screen qaud
  fsCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
  fsMaterial = new THREE.ShaderMaterial( {
      vertexShader: document.querySelector( '#fullscreen-vert' ).textContent.trim(),
      fragmentShader: document.querySelector( '#fullscreen-frag' ).textContent.trim(),
      uniforms: {
          tex: { value: null },
      }
  } );
  const fsQuad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), fsMaterial );
  fsScene = new THREE.Scene();
  fsScene.add( fsQuad );
}

function setupScene(minX, maxX, minY, maxY, imageCount, coordsX, coordsY, tex, object_vec4_arr_padded, arrows_arr_padded, obj_array_length, arrows_array_length, texAlphaMaps) {

  var alpha = document.getElementById("alpha").value;
  
  camera = new THREE.OrthographicCamera( minX, maxX, minY, maxY, 0, -1 );
  
  // texture coordinates
  const uvcoords = new Float32Array( [
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0,

      1.0,  0.0,
      0.0,  1.0,
      0.0,  0.0,
  ] );

  for( let i = 0; i < imageCount; i++) {
      scene[i] = new THREE.Scene();

      const vertices = new Float32Array( [
          coordsX[i][0], coordsY[i][0], 1.0 - (i+1) * (1.0 / (tex.length+1)), // 0
          coordsX[i][2], coordsY[i][2], 1.0 - (i+1) * (1.0 / (tex.length+1)), // 2
          coordsX[i][1], coordsY[i][1], 1.0 - (i+1) * (1.0 / (tex.length+1)), // 1

          coordsX[i][2], coordsY[i][2], 1.0 - (i+1) * (1.0 / (tex.length+1)), // 2
          coordsX[i][0], coordsY[i][0], 1.0 - (i+1) * (1.0 / (tex.length+1)), // 0
          coordsX[i][3], coordsY[i][3], 1.0 - (i+1) * (1.0 / (tex.length+1)), // 3
      ] );

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
      geometry.setAttribute( 'uv', new THREE.BufferAttribute( uvcoords, 2 ) );
      if (i == imageCount - 1){
          material[i] = new THREE.ShaderMaterial( {
              vertexShader: document.querySelector( '#blending-vert' ).textContent.trim(),
              fragmentShader: document.querySelector( '#blending-frag-obj' ).textContent.trim(),
              transparent: true,
              uniforms: {
                  tex: { value: tex[i] },
                  bgTex: { value: null },
                  resX: { value: maxX - minX },
                  resY: { value: maxY - minY },
                  alpha: { value: alpha },
                  //alphaMap: { value: texAlphaMaps[i] },
                  highlight: { value: 0 },
                  none: { value: true },
                  boundingBoxes: { value: false },
                  centerDots: { value: false },
                  arrows: { value: false },
                  borderColor: { value: new THREE.Color(255, 0, 0)},
                  color_array: {value: [
                    new THREE.Color(0xe41a1c),
                    new THREE.Color(0xfcd303),
                    new THREE.Color(0x6528F7),
                    new THREE.Color(0x2323d9),
                    new THREE.Color(0xff00d9),
                    new THREE.Color(0x377eb8),
                    new THREE.Color(0xff7f00),
                    new THREE.Color(0x7CFC00),
                    new THREE.Color(0x900C3F),
                    new THREE.Color(0x17becf),
                    new THREE.Color(0x0e9620),
                    new THREE.Color(0xe1c4ff),
                    new THREE.Color(0xB4C424),
                    new THREE.Color(0xd920f5)
                  ] },
                  obj_array: {value: object_vec4_arr_padded },
                  arrows_array: {value: arrows_arr_padded},
                  obj_array_length: {value: 82},
                  arrows_array_length: {value: 82},
              }
          } );
      }
      else{
          material[i] = new THREE.ShaderMaterial( {
              vertexShader: document.querySelector( '#blending-vert' ).textContent.trim(),
              fragmentShader: document.querySelector( '#blending-frag' ).textContent.trim(),
              transparent: true,
              uniforms: {
                  tex: { value: tex[i] },
                  bgTex: { value: null },
                  resX: { value: maxX - minX },
                  resY: { value: maxY - minY },
                  alpha: { value: alpha },
                  //alphaMap: { value: texAlphaMaps[i] },
                  highlight: { value: 0 },
                  none: { value: true },
                  boundingBoxes: { value: false },
                  centerDots: { value: false },
                  arrows: { value: false },
                  borderColor: { value: new THREE.Color(255, 0, 0)},
                  color_array: {value: [
                    new THREE.Color(0xe41a1c),
                    new THREE.Color(0xfcd303),
                    new THREE.Color(0x6528F7),
                    new THREE.Color(0x2323d9),
                    new THREE.Color(0xff00d9),
                    new THREE.Color(0x377eb8),
                    new THREE.Color(0xff7f00),
                    new THREE.Color(0x7CFC00),
                    new THREE.Color(0x900C3F),
                    new THREE.Color(0x17becf),
                    new THREE.Color(0x0e9620),
                    new THREE.Color(0xe1c4ff),
                    new THREE.Color(0xB4C424),
                    new THREE.Color(0xd920f5)
                  ] },
                  obj_array: {value: object_vec4_arr_padded },
                  arrows_array: {value: arrows_arr_padded},
                  obj_array_length: {value: 82},
                  arrows_array_length: {value: 82},
              }
          } );
      }
      material[i].side = THREE.DoubleSide;
      const quad = new THREE.Mesh( geometry, material[i] );
      scene[i].add( quad );
  }

  //return [material, scene, camera]
}

function animate(object_arr, arrows_arr, imageCount, texAlphaMaps) {
  //target, fsScene, fsCamera, fsMaterial, material, scene, camera, unique_obj_labels, object_arr, arrows_arr
  console.log("JUST GOT TO ANIMATE")
  console.log(arrows_arr)
            
  //requestAnimationFrame( animate );
  requestID = requestAnimationFrame(function() {animate(object_arr, arrows_arr, imageCount, texAlphaMaps);});

  // clear both render targets
  renderer.setRenderTarget( target[0] );
  renderer.clear();
  renderer.setRenderTarget( target[1] );
  renderer.clear();

  var startFrameIdx = document.getElementById("startFrame").value;
  var endFrameIdx = document.getElementById("endFrame").value;
  var alpha = document.getElementById("alpha").value;
  var highlightFrame = document.getElementById("highlightFrame").value;
  if (highlightFrame == 5){
    highlightFrame = 1
  }
  else if (highlightFrame == 4){
    highlightFrame = 2
  }
  else if (highlightFrame == 2){
    highlightFrame = 4
  }
  else if (highlightFrame == 1){
    highlightFrame = 5
  }
  var boundingBoxes = document.getElementById("boundingBoxes").checked;
  var centerDots = document.getElementById("centerDots").checked;
  var arrows = document.getElementById("arrows").checked;
  var none = document.getElementById("none").checked;
  let unique_obj_labels = ["Jar of nut butter", "Jar of jelly / jam", "plate", "paper towel", "cutting board", "butter knife", "person", "flour tortilla", "~12-inch strand of dental floss", "toothpicks"]

  //filter by confidence value (filter obj_array, RECOMPUTE ARROWS)
  var confidenceThreshold = document.getElementById("conf").value;
  var conf_obj_array = object_arr.filter((el) => el.confidence > confidenceThreshold);
  var conf_arrow_array = get_arrows(conf_obj_array)
  console.log("pls 0")
  console.log(conf_arrow_array)
  
  //filter by object label (just filter both)
  var obj_labels_checked = checkboxUpdateFunction()
  //ptIndex = obj_labels_checked.indexOf("paper towel")
  //const x = obj_labels_checked.splice(ptIndex, 1);
  var filtered_obj_array = conf_obj_array.filter((el) => obj_labels_checked.includes(unique_obj_labels[el.object_label])  );
  var filtered_arrow_array = conf_arrow_array.filter((el) => obj_labels_checked.includes(unique_obj_labels[el.z])  );
  console.log("pls 1")
  console.log(filtered_arrow_array)

  //make every row the same length to accomodate shader need for const length
  var object_vec4_arr_vec = filtered_obj_array.map(function(el) {return new THREE.Vector4(el.x, el.y, el.object_label, el.frame_index)})
  let obj_array_length_updated = object_vec4_arr_vec.length
  var object_vec4_arr_padded = object_vec4_arr_vec.concat(Array(400-object_vec4_arr_vec.length).fill(new THREE.Vector4( 1000, 1000, 1000, 1000 ))).sort((a, b) => parseFloat(a.z) - parseFloat(b.z));
  arrows_arr = filtered_arrow_array.map(function(el) {return new THREE.Vector4(el.x, el.y, el.z, el.w)})
  console.log("pls 2")
  console.log(arrows_arr)
  arrows_arr[3].w = 16
  arrows_arr[5].w = 17
  arrows_arr[7].w = 18
  arrows_arr[8].w = 19
  arrows_arr = arrows_arr.sort((a, b) => parseFloat(a.w) - parseFloat(b.w));
  console.log("pls 3")
  console.log(arrows_arr)
  let arrows_array_length_updated = arrows_arr.length
  var arrows_arr_padded = arrows_arr.concat(Array(400-arrows_arr.length).fill(new THREE.Vector4( 1000, 1000, 1000, 1000 )));

  console.log("arrows_arr_padded")
  console.log(arrows_arr_padded)

  // render scene into target
  var currentTarget, lastTarget;
  for (var i = 0; i < imageCount; i++) { //imageCount
      //if (i % dropout === 0){
          lastTarget = (i+1)%2;
          currentTarget = i%2;
          // set the current render target and clear it
          renderer.setRenderTarget( target[currentTarget] );
          renderer.clear();
          // render the previous results (full-screen quad)
          fsMaterial.uniforms.tex.value = target[lastTarget].texture;
          renderer.render( fsScene, fsCamera );
          // render the next image on top
          material[i].uniforms.bgTex.value = target[lastTarget].texture;
          material[i].uniforms.alpha.value = alpha;
          //material[i].uniforms.alphaMap.value = texAlphaMaps[i];
          //material[i].uniforms.alphaMap.needsUpdate = true;
          material[i].uniforms.highlight.value = (i == highlightFrame - 1)? 1 : 0;
          material[i].uniforms.boundingBoxes.value = boundingBoxes;
          material[i].uniforms.centerDots.value = centerDots;
          material[i].uniforms.arrows.value = arrows;
          material[i].uniforms.none.value = none;
          material[i].uniforms.borderColor.value = new THREE.Color(255, 0, 0);
          material[i].uniforms.obj_array.value = object_vec4_arr_padded;
          material[i].uniforms.arrows_array.value = arrows_arr_padded;
          //material[i].uniforms.obj_array_length.value = obj_array_length_updated;
          //material[i].uniforms.obj_array_length.value = arrows_array_length_updated;
          renderer.render( scene[i], camera );
     // }
  }

  // render the final result (all images) to the framebuffer
  renderer.setRenderTarget( null );
  renderer.clear();
  fsMaterial.uniforms.tex.value = target[currentTarget].texture;
  renderer.render( fsScene, fsCamera );

}

function frame_to_tex(){
  //stitch frames (depends on startidx, endidx, dstidx, kp detector, skip size, lowes threshold, RANSAC threshold, cluster thresholding on/off)
  //stitch_data = computedCoords, pano_width, pano_height, scaleFactor, anchorX, anchorY, new_transf_list, stitching_frames
  let stitch_data = stitch_frames(frames_arr); //need to make this filter for frames being stitched (including skip)
 
  // 
  let stitching_frames = stitch_data[7];
  console.log("LENGTH STITCHING FRAMES:")
  console.log(stitching_frames.length)
  console.log(stitching_frames)
  let jsonMasksForStitchedIndices = jsonMasks.filter(function(el, index) {
    if(stitching_frames.includes(el["frame_index"])){
      return el;
    }
  });
  console.log("jsonMasksForStitchedIndices");
  console.log(jsonMasksForStitchedIndices.length);
  console.log(jsonMasksForStitchedIndices);
  var precedent_frames_by_obj_and_keys = mask_images(jsonMasksForStitchedIndices, stitch_data[6], stitch_data[4], stitch_data[5])
  // load images as textures
  //imgTexData = [coordsX, coordsY, frameID, tex, minX, maxX, minY, maxY, imageCount] //use frameID to filter for frames being stitched
  var imgTexData = load_im_to_tex(stitch_data[0], jsonMasksForStitchedIndices, precedent_frames_by_obj_and_keys) 

  //const leftRangeSlider = document.getElementById('slider-distance').getElementsByTagName('startFrame');
  //leftRangeSlider.max = imgTexData[3].length - 1;

  //const rightRangeSlider = document.getElementById('slider-distance').getElementsByTagName('endFrame');
  //rightRangeSlider.max = imgTexData[3].length - 1;
  //rightRangeSlider.value = imgTexData[3].length - 1;

  return [stitch_data, imgTexData]
}

function empty(elem) {
  while (elem.lastChild) elem.removeChild(elem.lastChild);
}

//global variables
let requestID;
let renderer;
let camera;
let scene;
let material;
let target;
let fsScene; 
let fsCamera; 
let fsMaterial;
let geometry;

let frames_arr;
let total_frames_to_read;
let file_path;
let jsonDataDETIC;
let total_frames;
let jsonDETIC;
let obj_data;

let stitching_frames;
let dst_index;
let jsonMasks;

async function init_processing(){
  //stuff that only needs to be done once up top
  frames_arr = []
  total_frames_to_read = 5
  file_path = 'test_frames_VIS/' //'test_frames_VIS/'
  for (let i = 0; i < total_frames_to_read; i++){
      let src = new Image()
      src.src = file_path + String(i) + '.png'
      await new Promise(r => {
          src.onload = r
      })
      src = cv.imread(src)
      let srcGray = new cv.Mat();
      cv.cvtColor(src, srcGray, cv.COLOR_BGRA2GRAY);
      frames_arr.push(src);
  }

  jsonDataDETIC = await fetch("/teaser_detic.json"); //# frames total: 6901
  total_frames = 8
  jsonDETIC = await jsonDataDETIC.json();
  obj_data = init_obj_processing();
  console.log("unique object list")
  console.log(["Jar of nut butter", "Jar of jelly / jam", "plate", "paper towel", "cutting board", "butter knife", "person", "flour tortilla", "~12-inch strand of dental floss", "toothpicks"]  )
  //add_ticks_to_slider()
  jsonDataMasks = await fetch("/masks.json");
  jsonMasks = await jsonDataMasks.json();
  jsonDATASAM = await fetch("/summary_data_100.json");
  jsonSAM = await jsonDATASAM.json();
  jsonDATADETICSummary = await fetch("/detic_data.json");
  jsonDETICSummary = await jsonDATADETICSummary.json();
  let frame100_timestamp = 1680111562007 + (((1/15)*1000) * 100);
  let frame200_timestamp = 1680111562007 + (((1/15)*1000) * 200);
  let jsonDETICSummary_100_to_200 = jsonDETICSummary.filter((el) => (el.timestamp.slice(0,-2) >= frame100_timestamp && el.timestamp.slice(0,-2) <= frame200_timestamp));
  console.log(jsonDETICSummary_100_to_200)
  console.log(jsonDETICSummary_100_to_200.length)
  add_ticks_to_slider_exp_int(jsonDETICSummary_100_to_200)

  //matrix_summary_view()
  //stacked_summary_view()
  timeline_view()

  console.log(jsonMasks);
  //compute centroids 
  dist_threshold = 50
  centroids_arr = []
  for (let i = 0; i < 5; i++) {
    centroids = get_centroids(i, jsonMasks)
    jsonMasks[i]["centroids"] = centroids
  }
  console.log("jsonMasks with centroids:")
  console.log(jsonMasks)
}

async function generateNewPanorama() {

  //if requestID has been assigned, cancel previous animation
  if (typeof requestID !== 'undefined') {
    // requestID is defined, destroy previous panorama
    cancelAnimationFrame(requestID);

    renderer.clear()
    renderer.dispose()
    fsMaterial.dispose()
    geometry.dispose()

    for (let i = 0; i < scene.length; i++){
      scene[i].remove( scene[i] );
    }
    scene = null;

    for (let i = 0; i < fsScene.length; i++){
      fsScene[i].remove( fsScene[i] );
    }
    fsScene = null;

    for (let i = 0; i < material.length; i++){
      if ( material[i] ) material[i].dispose();
    }
  
    for (let i = 0; i < fsMaterial.length; i++){
      if ( fsMaterial[i] ) fsMaterial[i].dispose();
    }

    for (let i = 0; i < target.length; i++){
      if ( target[i] ) target[i].dispose();
    }

    container = document.getElementById( 'canvas-pano' );
    container.removeChild( renderer.domElement );

  }

  //call pano
  //panoData[0] = [computedCoords, pano_width, pano_height, scaleFactor, anchorX, anchorY, new_transf_list]
  //panoData[1] = [coordsX, coordsY, frameID, tex, minX, maxX, minY, maxY, imageCount, texAlphaMaps]
  let panoData = frame_to_tex()
  
  //redo objs
                                                //anchorX, anchorY, scaleFactor, pano_width, pano_height, new_transf_list
  let object_arr = filter_objs_by_frame_and_warp(panoData[0][4], panoData[0][5], panoData[0][3], panoData[0][1], panoData[0][2], panoData[0][6]);
                                              
  var object_vec4_arr_vec = object_arr.map(function(el) {return new THREE.Vector4(el.x, el.y, el.object_label, el.frame_index)});
  let obj_array_length = object_vec4_arr_vec.length;
  var object_vec4_arr_padded = object_vec4_arr_vec.concat(Array(400-object_vec4_arr_vec.length).fill(new THREE.Vector4( 1000, 1000, 1000, 1000 ))).sort((a, b) => parseFloat(a.z) - parseFloat(b.z));

  //redo arrows
  let arrows_arr = get_arrows(object_arr)
  let arrows_arr_vec = arrows_arr.map(function(el) {return new THREE.Vector4(el.x, el.y, el.z, el.w)})
  let arrows_array_length = arrows_arr_vec.length
  var arrows_arr_padded = arrows_arr_vec.concat(Array(400-arrows_arr.length).fill(new THREE.Vector4( 1000, 1000, 1000, 1000 )));

  //render
  renderer = [];
  camera = [];
  scene = [];
  material = [];
  target = [];
  fsScene = [];
  fsCamera = [];
  fsMaterial = [];
  dist_line_plot(real_data);
 
  // call initialize function only after loading image data
  //initData = [target, fsScene, fsCamera, fsMaterial, material, scene, camera, renderer]
  //var initData = init(panoData[1][5], panoData[1][4], panoData[1][7], panoData[1][6], panoData[1][8], panoData[1][0], panoData[1][1], panoData[1][3], renderer, camera, scene, material, controls, target, fsScene, fsCamera, fsMaterial, object_vec4_arr_padded, arrows_arr_padded);
  //init inputs: maxX, minX, maxY, minY, imageCount, coordsX, coordsY, tex, object_vec4_arr_padded, arrows_arr_padded
  init(panoData[1][5], panoData[1][4], panoData[1][7], panoData[1][6], panoData[1][8], panoData[1][0], panoData[1][1], panoData[1][3], object_vec4_arr_padded, arrows_arr_padded, obj_array_length, arrows_array_length, panoData[1][9]);
  
  console.log("RIGHT BEFORE ANIMATE")
  console.log(arrows_arr)

  //animate(initData[0], initData[1], initData[2], initData[3], initData[4], initData[5], initData[6], initData[7], obj_data[1], object_arr, arrows_arr);
  animate(object_arr, arrows_arr, panoData[1][8], panoData[1][9]);
  
}

function dist_line_plot(real_data){
  timelineCanvasWidth = document.getElementById("summary-matrix").offsetWidth;
  timelineCanvasHeight = document.getElementById("summary-matrix").offsetHeight;
  d3.selectAll("svg").remove();

  let objs = Array.from(["Jar of nut butter", "Jar of jelly / jam", "plate", "paper towel", "cutting board", "butter knife", "person", "flour tortilla", "~12-inch strand of dental floss", "toothpicks"]);

  function get_centroid_dist(real_data){
    let real_data_plot = []
    //for each new obj_label
    for (let i = 0; i < objs.length; i++) {
      let total_dist_so_far = 0;
      //for each frame
      for (let j = 0; j < real_data[0][objs[i]].length; j++) {
        if (j == 0){
          real_data_plot.push({"frame_idx": real_data[0][objs[i]][j]["frame"], "total_dist_so_far": 0, "obj_label": objs[i]})
        }
        else{
          let prev_centroid = real_data[0][objs[i]][j - 1]["warped_centroid"];
          let current_centroid = real_data[0][objs[i]][j]["warped_centroid"];
          let dist = Math.sqrt((current_centroid[0] - prev_centroid[0])**2 + (current_centroid[1] - prev_centroid[1])**2);
          total_dist_so_far = total_dist_so_far + dist
          real_data_plot.push({"frame_idx": real_data[0][objs[i]][j]["frame"], "total_dist_so_far": total_dist_so_far, "obj_label": objs[i]})
        }
      }
    }
    return real_data_plot
  }
  
  //let margin = {top: 40, right: 20, bottom: 20, left: 40};

  //let visWidth = 500 - margin.left - margin.right;

  //let visHeight = 300 - margin.top - margin.bottom;
  const margin = {top: 20, right: 25, bottom: 75, left: 40};
  const visWidth = timelineCanvasWidth - margin.left - margin.right;
  const visHeight = timelineCanvasHeight - margin.top - margin.bottom;

  let real_data_plot = get_centroid_dist(real_data);

  let real_data_plot_grouped_by_obj = Array.from(d3.rollup(real_data_plot, 
    group => group.sort((a, b) => d3.ascending(a.frame_idx, b.frame_idx)),
    obj => obj["obj_label"]));

  let xLine = d3.scaleLinear()
    .domain(d3.extent(real_data_plot, d => d.frame_idx))
    .range([0, visWidth]);

  let yLine = d3.scaleLinear()
  .domain(d3.extent(real_data_plot, d => parseInt(d["total_dist_so_far"]))).nice()
  .range([visHeight, 0]);

  let objColor = d3.scaleOrdinal()
  .domain(objs)
  .range(["#e41a1c", "#fcd303", "#6528F7", "#2323d9", "#ff00d9", "#377eb8", "#ff7f00", "#7CFC00", "#900C3F", "#17becf"]);

  const svg = d3.select("#summary-matrix").append("svg")
      .attr('width', visWidth + margin.left + margin.right)
      .attr('height', visHeight + margin.top + margin.bottom);

  const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // add title
  
  // create and add axes
  let format = d3.format('~s')

  let xAxisLine = d3.axisBottom(xLine)
  
  g.append("g")
      .attr("transform", `translate(0, ${visHeight})`)
      .call(xAxisLine);

  let yAxisLine = d3.axisLeft(yLine).tickFormat(format);
  
  g.append("g")
      .attr("transform", `translate(50, ${visWidth}-50)`)
      .call(yAxisLine)
  
  // draw line
  
  const line = d3.line()
      .x(d => xLine(d.frame_idx))
      .y(d => yLine(d.total_dist_so_far));
  
  for (let i = 0; i < objs.length; i++){
      g.append("path")
     .datum(real_data_plot_grouped_by_obj[i][1])
     .attr("d", line)
     .attr("fill", "none")
     .attr("stroke", objColor(real_data_plot_grouped_by_obj[i][0]))
     .attr("stroke-width", 2);
  }
  
  return svg.node();
}

function fixTextLabels(summary_data){
  for (let i = 0; i < summary_data.length; i++){
    if(summary_data[i]["text_prompt"] ==  "jar of jelly"){
       summary_data[i]["text_prompt"] = "Jar of jelly / jam"
    }
    if(summary_data[i]["text_prompt"] ==  "tortilla"){
       summary_data[i]["text_prompt"] = "flour tortilla"
    }
    if(summary_data[i]["text_prompt"] ==  "Cutting board"){
       summary_data[i]["text_prompt"] = "cutting board"
    }
    if(summary_data[i]["text_prompt"] ==  "Paper towels"){
       summary_data[i]["text_prompt"] = "paper towel"
    }
    if(summary_data[i]["text_prompt"] ==  "dental floss"){
       summary_data[i]["text_prompt"] = "~12-inch strand of dental floss"
    }
  }
  return summary_data
}

function get_matching_DETIC_frames(summary_data, DETIC_data){
  let objects_by_frame_arr = [];              
  let frame_increment = 15;
  let obj_times = DETIC_data.map(function (el) { return parseInt(el.timestamp.slice(0, -2)); });
  let start_time = obj_times[0];
  for (var i = 0; i < summary_data.length; i++) {
      var frame_timestamp = start_time+(((1/frame_increment)*1000)*summary_data[i]["frame"]);
      var closest_time = 10000000000000000000000000;
      for (var j = 0; j < obj_times.length; j++) {
        if (Math.abs(obj_times[j] - frame_timestamp) <= Math.abs(closest_time - frame_timestamp)){
          closest_time = obj_times[j]
        }
      }
      var closest_time_index = obj_times.indexOf(closest_time);
      var obj_label = summary_data[i]["text_prompt"];
      var DETIC_box = [];
      var DETIC_conf = NaN;
      if (DETIC_data[closest_time_index]["values"].length != 0){
        if (DETIC_box = DETIC_data[closest_time_index]["values"].find(obj => {return obj.label === obj_label}) === undefined){
          DETIC_box = [];
          DETIC_conf = NaN;
        }
        else{
          DETIC_box = DETIC_data[closest_time_index]["values"].find(obj => {return obj.label === obj_label})["xyxyn"];
          DETIC_conf = DETIC_data[closest_time_index]["values"].find(obj => {return obj.label === obj_label})["confidence"];
        }
      }
      var summary_box = [];
      if (summary_data[i]["box"].length == 0){
        summary_box = [];
      }
      else{
        summary_box = summary_data[i]["box"][0];
      }
      objects_by_frame_arr.push({"frame_index": summary_data[i]["frame"], "timestamp": frame_timestamp, "DETIC_index": closest_time_index, "summary_index": i, "DETIC_box": DETIC_box, "summary_box": summary_box, "obj_label": obj_label, "DETIC_confidence": DETIC_conf})
  }
  return objects_by_frame_arr
}

function getIoU(DETICbox, summaryBox){
  //determine the (x, y)-coordinates of the intersection rectangle
    let x1 = Math.max(DETICbox[0]*760, summaryBox[0]);
    let y1 = Math.max(DETICbox[1]*428, summaryBox[1]);
    let x2 = Math.min(DETICbox[2]*760, summaryBox[2]);
    let y2 = Math.min(DETICbox[3]*428, summaryBox[3]);

    if (x2 < x1 || y2 < y1){
      return 0.0
    }
 
  //compute the area of intersection rectangle
    let intersection_area = (x2 - x1) * (y2 - y1);
 
  //compute the area of both the prediction and ground-truth rectangles
    let DETICbox_area = (DETICbox[2]*760 - DETICbox[0]*760) * (DETICbox[3]*428 - DETICbox[1]*428);
    let summaryBox_area = (summaryBox[2] - summaryBox[0] + 1) * (summaryBox[3] - summaryBox[1] + 1);
 
  //compute the intersection over union by taking the intersection
  //area and dividing it by the sum of prediction + ground-truth
  //areas - the interesection area
    let iou = intersection_area / parseFloat(DETICbox_area + summaryBox_area - intersection_area);
 
  //return the intersection over union value
    return iou
}

function preprocessSummaryData(matched_boxes){
  let summary_matrix_data = [];
  for (let i = 0; i < matched_boxes.length; i++){
    let mask_detected = false;
    let DETIC_detected = false;
    let IoU = NaN;
    let classification = NaN;
    let frame = matched_boxes[i]["frame_index"];
    let obj_label = matched_boxes[i]["obj_label"];
    //check boxes
    if (matched_boxes[i]["summary_box"].length == 0){
      mask_detected = false;
    }
    else{
      mask_detected = true;
    }
    if (matched_boxes[i]["DETIC_box"].length == 0){
      DETIC_detected = false;
    }
    else{
      DETIC_detected = true;
    }
    //get IoU
    if (mask_detected == true && DETIC_detected == true){
      IoU = getIoU(matched_boxes[i]["DETIC_box"],matched_boxes[i]["summary_box"]);
    }
    else{
      IoU = NaN;
    }
    
    summary_matrix_data.push({"frame": frame, "obj_label": obj_label, "mask_detected": mask_detected, "DETIC_detected": DETIC_detected, "IoU": IoU, "conf": matched_boxes[i]["DETIC_confidence"], "classification": classification})
  }

  return summary_matrix_data;
}

function summary_matrix_data_format_IoU(summary_matrix_data){
  let count = 0
  let outer = []
  for(let i = 0; i < 100; i++){
    let inner = []
    for(let j = 0; j < 10; j++){
      inner.push(summary_matrix_data[count]["IoU"])
      count = count + 1
    }
    outer.push(inner)
  }
  return outer
}

function transpose(matrix) {
  return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

function summary_matrix_data_format_conf(summary_matrix_data){
  let count = 0
  let outer = []
  for(let i = 0; i < 100; i++){
    let inner = []
    for(let j = 0; j < 10; j++){
      inner.push(summary_matrix_data[count]["conf"])
      count = count + 1
    }
    outer.push(inner)
  }
  return outer
}

function drawHeatMap(missingDataColor, matrixIoU, matrixConf, dataShown) {
  timelineCanvasWidth = document.getElementById("summary-matrix").offsetWidth;
  timelineCanvasHeight = document.getElementById("summary-matrix").offsetHeight;
  console.log("LOOK NOW")
  console.log(timelineCanvasWidth)
  console.log(timelineCanvasHeight)
  d3.selectAll("svg").remove();
  const margin = {top: 20, right: 25, bottom: 75, left: 110};
  const width = timelineCanvasWidth - margin.left - margin.right;
  const height = timelineCanvasHeight - margin.top - margin.bottom;
  const labels = ["plate", "butter knife", "Jar of nut butter", "jar of jelly", "tortilla", "Cutting board", "person", "Paper towels", "toothpicks", "dental floss"];
  
  const svg = d3.select("#summary-matrix").append("svg")
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
  
  const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  g.append("g")
      .attr("transform", `translate(${width / 2}, ${-margin.top + 5})`)
    .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "hanging")
  
  // create scales
  let data = [];
  let colorScale = d3.interpolateBlues;
  if (dataShown == "IoU"){
    data = matrixIoU
    colorScale = d3.interpolateBlues;
  }
  else if (dataShown == "True/False Positive/Negative"){
    data = matrixIoU //FIX
    colorScale = d3.schemeSet1;
  }
  else{
    data = matrixConf
    colorScale = d3.interpolateGreens;
  }
  
  const xScale = d3.scaleBand()
      .domain(d3.range(data[0].length))
      .range([0, width])
      .padding(0.05);
  
  const yScale = d3.scaleBand()
      .domain(d3.range(data.length))
      //.domain(labels)
      .range([0, height])
      .padding(0.05);

  const nameScale = d3.scaleBand()
      .domain(labels)
      .range([0, height])
      .padding(0.05);

  var color = d3.scaleSequential()
      .domain([0, d3.max(data, d => d3.max(d))])
      .nice()
      .interpolator(d3.interpolateBlues)
      .unknown(missingDataColor);

  if (colorScale == d3.schemeSet1){
    color = d3.scaleOrdinal(d3.schemeSet1);
  }
  else if (colorScale == d3.interpolateGreens){
    color = d3.scaleSequential()
      .domain([0, d3.max(data, d => d3.max(d))])
      .nice()
      .interpolator(d3.interpolateGreens)
      .unknown(missingDataColor);
  }
  
  // create and add axes
  
  const xAxis = d3.axisTop(xScale);
  
  const yAxis = d3.axisLeft(yScale);

  const nameAxis = d3.axisLeft(nameScale);

  g.append("g")
      .call(nameAxis)
      .call(g => g.selectAll(".domain").remove())
      .style("font", "14px times");
  
  // draw squares
  
  const format = d3.format(".2f");

  const rows = g.append("g")
    .selectAll("g")
    .data(data)
    .join("g")
      .attr("transform", (d, i) => `translate(0, ${yScale(i)})`);
  
  const squares = rows.selectAll("g")
    .data(d => d)
    .join("g")
      .attr("transform", (d, i) => `translate(${xScale(i)}, 0)`)
      .call(g => g.append("rect")
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => color(d)));

  const horizontalScale = d3.scaleLinear()
        .domain([0, 100])
        .range([margin.left, margin.left + width]);

  var startLine = document.getElementById("startFrame").value - 1;
  var endLine = document.getElementById("endFrame").value - 1;

  // start line
  svg.append("line")
   .attr("y1", margin.top - 8)
   .attr("y2", height + margin.top + 8)
   .attr("x1", horizontalScale(startLine))
   .attr("x2", horizontalScale(startLine))
   .attr( "stroke", "black" )
   .attr( "stroke-width", "2" )

  //end line
  svg.append("line")
   .attr("y1", margin.top - 8)
   .attr("y2", height + margin.top + 8)
   .attr("x1", horizontalScale(endLine))
   .attr("x2", horizontalScale(endLine))
   .attr( "stroke", "black" )
   .attr( "stroke-width", "2" )
  
  return svg.node();
}

function timeline_view(){
 
  let summary_data_labels_fixed = fixTextLabels(jsonSAM);  

  let DETIC_data_matched = get_matching_DETIC_frames(summary_data_labels_fixed, jsonDETICSummary);

  let summary_matrix_data = preprocessSummaryData(DETIC_data_matched);

  let matrixIoU = transpose(summary_matrix_data_format_IoU(summary_matrix_data));

  let matrixConf = transpose(summary_matrix_data_format_conf(summary_matrix_data))

  var IoU = document.getElementById("IoU").checked;
  var conf = document.getElementById("confidence-matrix").checked;
  var TFPN = document.getElementById("TFPN").checked;
  var distancePlot = document.getElementById("distancePlot").checked;
  let dataShown = "IoU";
  if (IoU == true){
    dataShown = "IoU";
    drawHeatMap('#ccc', matrixIoU, matrixConf, dataShown)
  }
  else if (conf == true){
    dataShown = "Confidence";
    drawHeatMap('#ccc', matrixIoU, matrixConf, dataShown)
  }
  else if (TFPN == true){
    console.log("TFPN")
    dataShown = "TFPN";
    stacked_summary_view()
  }
  else if (distancePlot == true){
    console.log("distancePlot")
    dataShown = "distancePlot";
    dist_line_plot(real_data);
  }
  
}

function matrix_summary_view(){

  let summary_data_labels_fixed = fixTextLabels(jsonSAM);  

  let DETIC_data_matched = get_matching_DETIC_frames(summary_data_labels_fixed, jsonDETICSummary);

  let summary_matrix_data = preprocessSummaryData(DETIC_data_matched);

  let matrixIoU = transpose(summary_matrix_data_format_IoU(summary_matrix_data));

  let matrixConf = transpose(summary_matrix_data_format_conf(summary_matrix_data))

  var IoU = document.getElementById("IoU").checked;
  var conf = document.getElementById("confidence-matrix").checked;
  let dataShown = "IoU";
  if (conf == true){
    dataShown = "Confidence";
  }

  drawHeatMap('#ccc', matrixIoU, matrixConf, dataShown)
  
}

function stackedBarChart({data, yMax, yFormat, SAM_data_indices}) {
  timelineCanvasWidth = document.getElementById("summary-matrix").offsetWidth;
  timelineCanvasHeight = document.getElementById("summary-matrix").offsetHeight;
  d3.selectAll("svg").remove();
  //const margin = {top: 30, right: 0, bottom: 20, left: 40};
  //const visWidth = 500 - margin.left - margin.right;
  //const visHeight = 450 - margin.top - margin.bottom;
  const margin = {top: 20, right: 25, bottom: 75, left: 40};
  const visWidth = timelineCanvasWidth - margin.left - margin.right;
  const visHeight = timelineCanvasHeight - margin.top - margin.bottom;
  
  const svg = d3.select("#summary-matrix").append("svg")
      .attr('width', visWidth + margin.left + margin.right)
      .attr('height', visHeight + margin.top + margin.bottom);

  svg.append("image")
      .attr("x", timelineCanvasWidth*0.06)
      .attr("y", timelineCanvasWidth*0.02)
      .attr("width", timelineCanvasWidth*0.2)
      .attr("height", svg.attr("height") - 395)
      .attr("preserveAspectRatio", "none")
      .attr("xlink:href", "TFPN-legend.png");
  
  const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
  const x = d3.scaleBand()
      .domain(SAM_data_indices)
      .range([0, visWidth])
      .padding(0.25)
  
  const y = d3.scaleLinear()
      .domain([0, yMax]).nice()
      .range([visHeight, 0]);

  const color = d3.scaleOrdinal()
    .domain(["TP", "FP", "TN", "FN"])
    .range(d3.schemeTableau10);

  const horizontalScale = d3.scaleLinear()
        .domain([0, 100])
        .range([margin.left, margin.left + visWidth]);
  
  const yAxis = d3.axisLeft(y).tickFormat(d3.format(yFormat));
  
  
  g.append("g")
      .call(yAxis)
      .call(g => g.select('.domain').remove())
    .append('text')
      .attr('fill', 'black')
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'hanging')
      .attr('font-weight', 'bold')
      .attr('y', -margin.top + 5)
      .attr('x', -margin.left);
  
  const series = g.append('g')
    .selectAll('g')
    .data(data)
    .join('g')
      .attr('fill', d => color(d.key));
  
  series.selectAll('rect')
    .data(d => d)
    .join('rect')
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('x', d => x(d.data.frame))
      .attr('width', x.bandwidth());

  var startLine = document.getElementById("startFrame").value - 1;
  var endLine = document.getElementById("endFrame").value - 1;

  var startLine = document.getElementById("startFrame").value - 1;
  var endLine = document.getElementById("endFrame").value - 1;

  // start line
  svg.append("line")
   .attr("y1", margin.top - 8)
   .attr("y2", visHeight + margin.top + 8)
   .attr("x1", horizontalScale(startLine))
   .attr("x2", horizontalScale(startLine))
   .attr( "stroke", "black" )
   .attr( "stroke-width", "2" )

  //end line
  svg.append("line")
   .attr("y1", margin.top - 8)
   .attr("y2", visHeight + margin.top + 8)
   .attr("x1", horizontalScale(endLine))
   .attr("x2", horizontalScale(endLine))
   .attr( "stroke", "black" )
   .attr( "stroke-width", "2" )
  
  return svg.node();
}

function get_SAM_matches_for_DETIC(DETIC_data, SAM_data_labels_fixed_grouped){
  let SAM_data = SAM_data_labels_fixed_grouped;
  let objects_by_frame_arr = [];              
  let SAM_frame_increment = 15;
  let start_time = DETIC_data[0]["timestamp"].slice(0, -2);
  let SAM_frames = Object.keys(SAM_data);
  let SAM_frame_timestamps = SAM_frames.map(function (el) { return parseInt(start_time) + ((1/SAM_frame_increment)*1000) * parseInt(el); });
  for (var i = 0; i < DETIC_data.length; i++) {
    var DETIC_output_timestamp = parseFloat(DETIC_data[i]["timestamp"].slice(0, -2));
    var closest_time = 10000000000000000000000000.0;
    for (var j = 0; j < SAM_frame_timestamps.length; j++) {
      if (Math.abs(SAM_frame_timestamps[j] - DETIC_output_timestamp) <= Math.abs(closest_time - DETIC_output_timestamp)){
        closest_time = SAM_frame_timestamps[j];
      }
    }
    var closest_time_index = SAM_frame_timestamps.indexOf(closest_time); //this is the KEY for SAM_data

    //for each detection in this detic output
    if (DETIC_data[i]["values"].length != 0){
      for (var j = 0; j < DETIC_data[i]["values"].length; j++) {
        var obj_label = DETIC_data[i]["values"][j]["label"];
        var DETIC_box = DETIC_data[i]["values"][j]["xyxyn"];
        var DETIC_conf = DETIC_data[i]["values"][j]["confidence"];
        var SAM_box = [];
        if (SAM_data[SAM_frames[closest_time_index]].find(obj => {return obj.text_prompt === obj_label})["box"].length != 0){
          SAM_box = SAM_data[SAM_frames[closest_time_index]].find(obj => {return obj.text_prompt === obj_label})["box"][0];
        }
        objects_by_frame_arr.push({"frame_index": SAM_data[SAM_frames[closest_time_index]][0]["frame"], "DETIC_output_timestamp": DETIC_output_timestamp, "SAM_index": closest_time_index, "DETIC_index": i, "DETIC_box": DETIC_box, "SAM_box": SAM_box, "obj_label": obj_label, "DETIC_confidence": DETIC_conf})
      }
    } 
  }
  return objects_by_frame_arr
}

function get_test_TFPN_data(SAM_data_indices){
  let FAKE_getTFPNByFrame = [];
  for(let i = 0; i < SAM_data_indices.length; i++){
    let TP_count = Math.floor(Math.random() * 10);
    let FP_count = Math.floor(Math.random() * 10);
    let TN_count = Math.floor(Math.random() * 10);
    let FN_count = Math.floor(Math.random() * 10);
    let total = TP_count + FP_count + TN_count + FN_count;
    
    FAKE_getTFPNByFrame.push({"frame": SAM_data_indices[i], "TP": TP_count, "FP": FP_count, "TN": TN_count, "FN": FN_count, "total": total})
  }
  return FAKE_getTFPNByFrame;
}

function getTFPNByFrame(DETIC_data_matched_100_to_200, SAM_data_indices, SAM_data_labels_fixed){
  let TFPN_by_frame = [];
  for (let i = 0; i < SAM_data_indices.length; i++){
    let TP_count = 0;
    let FP_count = 0;
    let TN_count = 0;
    let FN_count = 0;
    let frame_index = SAM_data_indices[i];
    let closest_index = 10000000000000000000000000;
    for (var j = 0; j < DETIC_data_matched_100_to_200.length; j++) {
          let DETIC_index = DETIC_data_matched_100_to_200[j]["frame_index"];
          if (Math.abs(DETIC_index - frame_index) <= Math.abs(closest_index - frame_index)){
            closest_index = DETIC_index;
          }
    }
    let closest_MATCHED = Object.groupBy(DETIC_data_matched_100_to_200.filter((el) => el.frame_index == closest_index), ({ obj_label }) => obj_label);
    //check everything DETIC got
    let objs = Object.keys(closest_MATCHED);
    for (let j = 0; j < objs.length; j++){
      if (closest_MATCHED[objs[j]].length != 1){ //if frame has duplicates for this object
        if (objs[j] == "person"){
          FP_count = FP_count + closest_MATCHED[objs[j]].length - 2 //for real dupes like person this should be -2
        }
        else{
          FP_count = FP_count + closest_MATCHED[objs[j]].length - 1
        }
        //GET ALL IoUs and PICK BEST 
        let best_IoU = 0;
        for (let k = 0 ; k < closest_MATCHED[objs[j]].length; k++){
          let DETIC_box = closest_MATCHED[objs[j]][k]["DETIC_box"];
          let SAM_box = closest_MATCHED[objs[j]][k]["SAM_box"];
          let IoU = getIoU(DETIC_box, SAM_box);
          if (IoU >= best_IoU){
            best_IoU = IoU
          }
        }
        if (best_IoU >= 0.5){
          TP_count = TP_count + 1
        }
        else{
          FP_count = FP_count + 1
        }
      }
      else{
        let DETIC_box = closest_MATCHED[objs[j]][0]["DETIC_box"];
        let SAM_box = closest_MATCHED[objs[j]][0]["SAM_box"];
        let IoU = getIoU(DETIC_box, SAM_box);
        if (IoU >= 0.5){
          TP_count = TP_count + 1
        }
        else if (IoU < 0.5){
          FP_count = FP_count + 1
        }
      }
    }

    //get the rest of SAM that DETIC didn't get for TN/FN
    let labels = ["Jar of nut butter", "Jar of jelly / jam", "plate", "paper towel", "cutting board", "butter knife", "person", "flour tortilla", "~12-inch strand of dental floss", "toothpicks"];
    for (let j = 0; j < labels.length; j++){
      let el = SAM_data_labels_fixed.find(el => {return el.frame == SAM_data_indices[i] && el.text_prompt == labels[j]});
      if(!objs.includes(el.text_prompt)){
        if(el["box"].length == 0){
          TN_count = TN_count + 1
        }
        else{
          FN_count = FN_count + 1
        }
      }
    }

    let total = TP_count + FP_count + FN_count + TN_count
    TFPN_by_frame.push({"frame": SAM_data_indices[i], "TP": TP_count, "FP": FP_count, "TN": TN_count, "FN": FN_count, "total": total})
  }
  
  return TFPN_by_frame;
}

function stacked_summary_view(){

  let SAM_data_labels_fixed = fixTextLabels(jsonSAM);  

  let SAM_data_labels_fixed_grouped = Object.groupBy(fixTextLabels(jsonSAM), ({ frame }) => frame);

  let DETIC_data_matched = get_SAM_matches_for_DETIC(jsonDETICSummary, SAM_data_labels_fixed_grouped);

  let SAM_data_indices = Object.keys(SAM_data_labels_fixed_grouped);

  let frame100_timestamp = 1680111562007 + (((1/15)*1000) * 100);

  let frame200_timestamp = 1680111562007 + (((1/15)*1000) * 200);
  
  let DETIC_data_matched_100_to_200 = DETIC_data_matched.filter((el) => (el.DETIC_output_timestamp >= frame100_timestamp && el.DETIC_output_timestamp <= frame200_timestamp));

  let metric_data_by_frame = getTFPNByFrame(DETIC_data_matched_100_to_200, SAM_data_indices, SAM_data_labels_fixed);

  let metrics = ["TP", "FP", "TN", "FN"];

  let stacked = d3.stack().keys(metrics)(metric_data_by_frame);

  let maxTotalDetections = d3.max(metric_data_by_frame, d => d.total);

  stackedBarChart({
    data: stacked,
    yMax: maxTotalDetections,
    yFormat: '',
    SAM_data_indices: SAM_data_indices
  })
  
}

function call_both(){
  matrix_summary_view();
  stacked_summary_view();
}

/* Set the width of the sidebar to 250px (show it) */
function openNav() {
  document.getElementById("mySidepanel").style.width = "30%";
}

/* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
  document.getElementById("mySidepanel").style.width = "0";
}