//import { cv } from "./opencv.js";
//import * as THREE from 'three';
//THREE = require('three');
//import Stats from 'three/addons/libs/stats.module.js';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

function append_ticks(frames, total_frames, type) {
  //total_frames = total_frames*.7

  for (var x = 0; x < frames.length; x++){
    percent = (frames[x]/total_frames)*100
    //parseInt((frames[x]/total_frames)*100)
      
    if (type == "duplicates"){
      var tick_color = 'ticks-orange'
    }

    if (type == "new_objects"){
      var tick_color = 'ticks-green'
    }

    if (type == "removed_from_memory"){
      var tick_color = 'ticks-red'
    }

    if (type == "returned"){
      var tick_color = 'ticks-blue'
    }

    $("[slider] > div" ).append("<div class=" + tick_color + " style='left:"+ (percent + 1) + "%'></div>");
    

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

  let all_obj_ids = ["Bowl", "Mug", "Salt", "RedBull", "Pringles", "Popcorn", "DishSoap", "Almonds", "OatmealSquares", "Rice", "TomatoSauce", "Cereal", "Creamer", "Coke"]
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
  let unique_obj_labels = obj_data[1]
  var object_arr = []
  scaleFactor = 1
  console.log("dst_index in warp to pano")
  console.log(dst_index)
  console.log("scaleFactor:")
  console.log(scaleFactor)
  console.log("pano_width:")
  console.log(pano_width)
  console.log("pano_height:")
  console.log(pano_height)
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
          if (i == 0){
            console.log("bounding_box_texture_coords:")
            console.log(bounding_box_texture_coords)
            console.log("bounding_box:")
            console.log(bounding_box)
            console.log("lin_homg_pts:")
            console.log(lin_homg_pts)
            console.log("new_transf_list[i]:")
            console.log(new_transf_list[i])
            console.log("trans_lin_homg_pts:")
            console.log(trans_lin_homg_pts)

            console.log("SCALED X:")
            console.log(trans_lin_homg_pts[0][0]*scaleFactor)
            console.log("FINAL X COORD:")
            console.log((trans_lin_homg_pts[0][0]*scaleFactor) / pano_width)

            console.log("SCALED Y:")
            console.log(1 - ((trans_lin_homg_pts[1][0]*scaleFactor)))
            console.log("FINAL Y COORD:")
            console.log(1 - ((trans_lin_homg_pts[1][0]*scaleFactor) / pano_height))

            console.log("SCALED W:")
            console.log(trans_lin_homg_pts[0][1]*scaleFactor)
            console.log("FINAL W COORD:")
            console.log((trans_lin_homg_pts[0][1]*scaleFactor) / pano_width)

            console.log("SCALED H:")
            console.log(1 - ((trans_lin_homg_pts[1][1]*scaleFactor)))
            console.log("FINAL H COORD:")
            console.log(1 - ((trans_lin_homg_pts[1][1]*scaleFactor) / pano_height))

          }
  
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
  let unique_obj_labels = obj_data[1]
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
  let unique_obj_labels = obj_data[1]
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
  arrows_arr = arrows_arr.flat().sort((a, b) => parseFloat(a.w) - parseFloat(b.w));
  return arrows_arr
}

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

//stitch frames (depends on startidx, endidx, dstidx, kp detector, skip size, lowes threshold, RANSAC threshold, cluster thresholding on/off)
function stitch_frames(){

  //get frames to stitch and assign base frame
  var startFrameIdx = document.getElementById("startFrame").value;
  var endFrameIdx = document.getElementById("endFrame").value;
  var skip_size = parseInt(document.getElementById("dropout").value);
  stitching_frames = []

  for (let i = 0; i < (endFrameIdx - startFrameIdx + 1); i = i + skip_size){
    stitching_frames.push(parseInt(i))
  }
  console.log("Frames being stitched:")
  console.log(stitching_frames)

  //let dst_index = 0;
  //let dst_index = parseInt(Math.floor((endFrameIdx - startFrameIdx)/2)); 
  dst_index = parseInt(stitching_frames[Math.floor(stitching_frames.length / 2)]); 
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
  computedCoords[0] = {'frame_id': 0, 'corner_1_x': anchorX, 'corner_1_y': anchorY, 'corner_2_x': dst_width + anchorX, 'corner_2_y': anchorY, 'corner_3_x': dst_width + anchorX, 'corner_3_y': dst_height + anchorY, 'corner_4_x': anchorX, 'corner_4_y': dst_height + anchorY}
  
  for (let i = 0; i < new_transf_list.length; i++){
      var src_lin_homg_pts = [[0, src_width, src_width, 0], [0, 0, src_height, src_height], [1, 1, 1, 1]]
      var src_trans_lin_homg_pts = [...Array(3)].map(e => Array(4));
      multiply(new_transf_list[i], src_lin_homg_pts, src_trans_lin_homg_pts)
      src_trans_lin_homg_pts = divide_array_by_last_row(src_trans_lin_homg_pts)
      computedCoords[i+1] = {'frame_id': i+1, 'corner_1_x': Math.round(src_trans_lin_homg_pts[0][0]), 'corner_1_y': Math.round(src_trans_lin_homg_pts[1][0]), 'corner_2_x': Math.round(src_trans_lin_homg_pts[0][1]), 'corner_2_y': Math.round(src_trans_lin_homg_pts[1][1]), 'corner_3_x': Math.round(src_trans_lin_homg_pts[0][2]), 'corner_3_y': Math.round(src_trans_lin_homg_pts[1][2]), 'corner_4_x': Math.round(src_trans_lin_homg_pts[0][3]), 'corner_4_y': Math.round(src_trans_lin_homg_pts[1][3])}
  }

  console.log("corners computed")

  //scale everything down (in proportion) so it fits next to the controls
  let xSize = 1000
  let ySize = 1000
  let xFrameMin = 1000
  let xFrameMax = 0
  let yFrameMin = 1000
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

  return [computedCoords, pano_width, pano_height, scaleFactor, anchorX, anchorY, new_transf_list]
}

function load_im_to_tex(computedCoords){
  var tex = [];
  var coordsX = [];
  var coordsY = [];
  var frameID = {};

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
      frameID[key] = value.frame_id;
      tex[key] = new THREE.TextureLoader().load( file_path + (parseInt(key)).toString() + '.png' );
  });

  // get min/max x/y values
  var minX = Math.min(...coordsX.map(item => Math.min.apply(null, item)));
  var maxX = Math.max(...coordsX.map(item => Math.max.apply(null, item)));
  var minY = Math.min(...coordsY.map(item => Math.min.apply(null, item)));
  var maxY = Math.max(...coordsY.map(item => Math.max.apply(null, item)));

  coordsX[tex.length] = [minX, maxX, maxX, minX];
  coordsY[tex.length] = [minY, minY, maxY, maxY];
  frameID[tex.length] = tex.length + 1;
  tex[tex.length] = new THREE.TextureLoader().load( 'transparent.png' );
  var imageCount = tex.length;
  console.log(imageCount)

  console.log("textures loaded")

  //update highlight slider
  var sliderframe = document.getElementById("highlightFrame");
  sliderframe.max = imageCount - 1

  return [coordsX, coordsY, frameID, tex, minX, maxX, minY, maxY, imageCount]
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
  var object_arr = warp_to_panorama_case_study(objects_by_frame_arr_frames_being_stitched, anchorX, anchorY, scaleFactor, pano_width, pano_height, new_transf_list)
  
  return object_arr
}

function add_ticks_to_slider_case_study(){
  //get annotations for SLIDER (separate from panorama)
  obj_data_0 = obj_data[0]
  unique_obj_labels = obj_data[1]

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
  var unique_obj_labels = JSON.parse(JSON.stringify(new_objs));
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

  //frames when objects that have been removed from memory come back
  //like seen list, but "currently removed list", items get added as they appear in memory_removed
  //if something from the "currently removed list" is present in the current frame it gets added to returning_objs and removed from currently removed list 
 /*
  console.log(memory_removed)
  currently_removed_list = []
  returning_objs = []
  for (var i = 0; i < counts_by_DETIC_output.length; i++){
      var current_frame = counts_by_DETIC_output[i].frame_idx

      //update currently_removed_list
      memory_removed_frames_arr

      //var closest = counts.reduce(function(prev, curr) {
        //  return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
      //});


      if (currently_removed_list.length > 0){
          var returning = []
          var objects = Object.keys(counts_by_DETIC_output[i].counts)
      }
  }
  */

  //add ticks
  total_frames_slider = obj_data_0.length
  append_ticks(duplicate_objs_frames_arr, total_frames_slider, "duplicates") //duplicate_objs_frames_arr //[13, 45, 73] //tick_frames[0] //[13, 18]
  append_ticks(new_objs_frames_arr, total_frames_slider, "new_objects") //new_objs_frames_arr //tick_frames[1] //[5, 8, 10]
  append_ticks(memory_removed_frames_arr, total_frames_slider, "removed_from_memory") //tick_frames[2] //[15, 20]
  //append_ticks([24], total_frames_slider, "returned")

  //return [duplicate_objs_frames_arr, new_objs_frames_arr, memory_removed_frames_arr]
}

function add_ticks_to_slider(){
  //get annotations for SLIDER (separate from panorama)
  obj_data_0 = obj_data[0]
  unique_obj_labels = obj_data[1]

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
  var unique_obj_labels = JSON.parse(JSON.stringify(new_objs));
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

  //frames when objects that have been removed from memory come back
  //like seen list, but "currently removed list", items get added as they appear in memory_removed
  //if something from the "currently removed list" is present in the current frame it gets added to returning_objs and removed from currently removed list 
 /*
  console.log(memory_removed)
  currently_removed_list = []
  returning_objs = []
  for (var i = 0; i < counts_by_DETIC_output.length; i++){
      var current_frame = counts_by_DETIC_output[i].frame_idx

      //update currently_removed_list
      memory_removed_frames_arr

      //var closest = counts.reduce(function(prev, curr) {
        //  return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
      //});


      if (currently_removed_list.length > 0){
          var returning = []
          var objects = Object.keys(counts_by_DETIC_output[i].counts)
      }
  }
  */

  //add ticks
  total_frames_slider = obj_data_0.length
  append_ticks(duplicate_objs_frames_arr, total_frames_slider, "duplicates") //duplicate_objs_frames_arr //[13, 45, 73] //tick_frames[0] //[13, 18]
  append_ticks(new_objs_frames_arr, total_frames_slider, "new_objects") //new_objs_frames_arr //tick_frames[1] //[5, 8, 10]
  append_ticks(memory_removed_frames_arr, total_frames_slider, "removed_from_memory") //tick_frames[2] //[15, 20]
  //append_ticks([24], total_frames_slider, "returned")

  //return [duplicate_objs_frames_arr, new_objs_frames_arr, memory_removed_frames_arr]
}

function init(maxX, minX, maxY, minY, imageCount, coordsX, coordsY, tex, object_vec4_arr_padded, arrows_arr_padded, obj_array_length, arrows_array_length) {
  // fps counter (can be removed)
  //stats = new Stats();
  //document.body.appendChild( stats.dom );

  // WebGL renderer update
  renderer = new THREE.WebGLRenderer( { preserveDrawingBuffer: true } );
  renderer.autoClear = false;
  renderer.setClearColor( 0xffffff, 1.0 );
  container = document.getElementById( 'canvas-pano' );
  //document.body.appendChild( container );
  container.appendChild( renderer.domElement );

  //document.body.appendChild( renderer.domElement );

  // Create two render targets for ping-pong rendering
  //target = 
  setupRenderTargets(maxX, minX, maxY, minY);

  // Our scene
  //setupData = [material, scene, camera]
  //var setupData =
  setupScene(minX, maxX, minY, maxY, imageCount, coordsX, coordsY, tex, object_vec4_arr_padded, arrows_arr_padded, obj_array_length, arrows_array_length);

  // Setup rendering step for fullscreen quad rendering (show render target texture)
  //fsData =  [fsScene, fsCamera, fsMaterial]
  //var fsData = 
  setupFullscreenQuadRendering(fsScene, fsCamera, fsMaterial);

  // resize render targets
  for (var i = 0; i < target.length; i++) {
      target[i].setSize( maxX - minX, maxY - minY );
  }
  // set renderer size to image size
  renderer.setSize( (maxX - minX) / 1.0, (maxY - minY) / 1.0 );

  //return [target, fsData[0], fsData[1], fsData[2], setupData[0], setupData[1], setupData[2]]
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

  //return target
}

function setupFullscreenQuadRendering() {
  // renders a texture on a full-screen qaud
  fsCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
  fsMaterial = new THREE.ShaderMaterial( {
      vertexShader: document.querySelector( '#fullscreen-vert' ).textContent.trim(),
      fragmentShader: document.querySelector( '#fullscreen-frag' ).textContent.trim(),
      uniforms: {
          tex: { value: null }
      }
  } );
  const fsQuad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), fsMaterial );
  fsScene = new THREE.Scene();
  fsScene.add( fsQuad );

  //return [fsScene, fsCamera, fsMaterial]
}

function setupScene(minX, maxX, minY, maxY, imageCount, coordsX, coordsY, tex, object_vec4_arr_padded, arrows_arr_padded, obj_array_length, arrows_array_length) {

  console.log("object_vec4_arr_padded")
  console.log(object_vec4_arr_padded)
  console.log("arrows_arr_padded")
  console.log(arrows_arr_padded)

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
              uniforms: {
                  tex: { value: tex[i] },
                  bgTex: { value: null },
                  resX: { value: maxX - minX },
                  resY: { value: maxY - minY },
                  alpha: { value: alpha },
                  highlight: { value: 0 },
                  none: { value: true },
                  boundingBoxes: { value: false },
                  centerDots: { value: false },
                  arrows: { value: false },
                  borderColor: { value: new THREE.Color(255, 0, 0)},
                  color_array: {value: [
                    new THREE.Color(0xe41a1c),
                    new THREE.Color(0xffff33),
                    new THREE.Color(0x7CFC00),
                    new THREE.Color(0x2323d9),
                    new THREE.Color(0x6528F7),
                    new THREE.Color(0x377eb8),
                    new THREE.Color(0xff7f00),
                    new THREE.Color(0x900C3F),
                    new THREE.Color(0xff00d9),
                    new THREE.Color(0x17becf),
                    new THREE.Color(0x0e9620),
                    new THREE.Color(0xe1c4ff),
                    new THREE.Color(0xB4C424),
                    new THREE.Color(0xd920f5)
                  ] },
                  obj_array: {value: object_vec4_arr_padded },
                  arrows_array: {value: arrows_arr_padded},
                  obj_array_length: {value: obj_array_length},
                  arrows_array_length: {value: arrows_array_length},
              }
          } );
      }
      else{
          material[i] = new THREE.ShaderMaterial( {
              vertexShader: document.querySelector( '#blending-vert' ).textContent.trim(),
              fragmentShader: document.querySelector( '#blending-frag' ).textContent.trim(),
              uniforms: {
                  tex: { value: tex[i] },
                  bgTex: { value: null },
                  resX: { value: maxX - minX },
                  resY: { value: maxY - minY },
                  alpha: { value: alpha },
                  highlight: { value: 0 },
                  none: { value: true },
                  boundingBoxes: { value: false },
                  centerDots: { value: false },
                  arrows: { value: false },
                  borderColor: { value: new THREE.Color(255, 0, 0)},
                  color_array: {value: [
                    new THREE.Color(0xe41a1c),
                    new THREE.Color(0xffff33),
                    new THREE.Color(0x7CFC00),
                    new THREE.Color(0x2323d9),
                    new THREE.Color(0x6528F7),
                    new THREE.Color(0x377eb8),
                    new THREE.Color(0xff7f00),
                    new THREE.Color(0x900C3F),
                    new THREE.Color(0xff00d9),
                    new THREE.Color(0x17becf),
                    new THREE.Color(0x0e9620),
                    new THREE.Color(0xe1c4ff),
                    new THREE.Color(0xB4C424),
                    new THREE.Color(0xd920f5)
                  ] },
                  obj_array: {value: object_vec4_arr_padded },
                  arrows_array: {value: arrows_arr_padded},
                  obj_array_length: {value: obj_array_length},
                  arrows_array_length: {value: arrows_array_length},
              }
          } );
      }
      material[i].side = THREE.DoubleSide;
      const quad = new THREE.Mesh( geometry, material[i] );
      scene[i].add( quad );
  }

  //return [material, scene, camera]
}

function animate(object_arr, arrows_arr, imageCount) {
  //target, fsScene, fsCamera, fsMaterial, material, scene, camera, unique_obj_labels, object_arr, arrows_arr
            
  //requestAnimationFrame( animate );
  requestID = requestAnimationFrame(function() {animate(object_arr, arrows_arr, imageCount);});

  // clear both render targets
  renderer.setRenderTarget( target[0] );
  renderer.clear();
  renderer.setRenderTarget( target[1] );
  renderer.clear();

  var startFrameIdx = document.getElementById("startFrame").value;
  var endFrameIdx = document.getElementById("endFrame").value;
  //var dropout = document.getElementById("dropout").value;
  var alpha = document.getElementById("alpha").value;
  var highlightFrame = document.getElementById("highlightFrame").value;
  var boundingBoxes = document.getElementById("boundingBoxes").checked;
  var centerDots = document.getElementById("centerDots").checked;
  var arrows = document.getElementById("arrows").checked;
  var none = document.getElementById("none").checked;
  let unique_obj_labels = obj_data[1]

  //filter by confidence value (filter obj_array, RECOMPUTE ARROWS)
  var confidenceThreshold = document.getElementById("conf").value;
  var conf_obj_array = object_arr.filter((el) => el.confidence > confidenceThreshold);
  var conf_arrow_array = get_arrows(conf_obj_array)
  
  //filter by object label (just filter both)
  var obj_labels_checked = checkboxUpdateFunction()
  var filtered_obj_array = conf_obj_array.filter((el) => obj_labels_checked.includes(unique_obj_labels[el.object_label])  );
  var filtered_arrow_array = conf_arrow_array.filter((el) => obj_labels_checked.includes(unique_obj_labels[el.z])  );

  //make every row the same length to accomodate shader need for const length
  var object_vec4_arr_vec = filtered_obj_array.map(function(el) {return new THREE.Vector4(el.x, el.y, el.object_label, el.frame_index)})
  let obj_array_length_updated = object_vec4_arr_vec.length
  var object_vec4_arr_padded = object_vec4_arr_vec.concat(Array(700-object_vec4_arr_vec.length).fill(new THREE.Vector4( 1000, 1000, 1000, 1000 ))).sort((a, b) => parseFloat(a.z) - parseFloat(b.z));
  arrows_arr = filtered_arrow_array.map(function(el) {return new THREE.Vector4(el.x, el.y, el.z, el.w)})
  let arrows_array_length_updated = arrows_arr.length
  var arrows_arr_padded = arrows_arr.concat(Array(700-arrows_arr.length).fill(new THREE.Vector4( 1000, 1000, 1000, 1000 )));

  // render scene into target
  var currentTarget, lastTarget;
  for (var i = startFrameIdx-1; i < imageCount; i++) {
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
          material[i].uniforms.highlight.value = (i == highlightFrame - 1)? 1 : 0;
          material[i].uniforms.boundingBoxes.value = boundingBoxes;
          material[i].uniforms.centerDots.value = centerDots;
          material[i].uniforms.arrows.value = arrows;
          material[i].uniforms.none.value = none;
          material[i].uniforms.borderColor.value = new THREE.Color(255, 0, 0);
          material[i].uniforms.obj_array.value = object_vec4_arr_padded;
          material[i].uniforms.arrows_array.value = arrows_arr_padded;
          material[i].uniforms.obj_array_length.value = obj_array_length_updated;
          material[i].uniforms.obj_array_length.value = arrows_array_length_updated;
          renderer.render( scene[i], camera );
     // }
  }

  // render the final result (all images) to the framebuffer
  renderer.setRenderTarget( null );
  renderer.clear();
  fsMaterial.uniforms.tex.value = target[currentTarget].texture;
  renderer.render( fsScene, fsCamera );

  // update fps counter
  //stats.update();

}

function frame_to_tex(){
  //stitch frames (depends on startidx, endidx, dstidx, kp detector, skip size, lowes threshold, RANSAC threshold, cluster thresholding on/off)
  //stitch_data = computedCoords, pano_width, pano_height, scaleFactor, anchorX, anchorY, new_transf_list
  let stitch_data = stitch_frames(frames_arr); //need to make this filter for frames being stitched (including skip)
        
  // load images as textures
  //imgTexData = [coordsX, coordsY, frameID, tex, minX, maxX, minY, maxY, imageCount] //use frameID to filter for frames being stitched
  var imgTexData = load_im_to_tex(stitch_data[0]) 

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

async function init_processing(){
  //stuff that only needs to be done once up top
  frames_arr = []
  total_frames_to_read = 100
  file_path = 'case_study_example/'
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

  jsonDataDETIC = await fetch("/GMU-Scene-1-DETIC-generic-vocab-2-with-extra-objs-mug-bowl-salt-no-nums-first-100.json"); //# frames total: 6901
  total_frames = 100
  jsonDETIC = await jsonDataDETIC.json();
  obj_data = init_obj_processing_case_study();
  console.log("unique object list")
  console.log(obj_data[1])
  add_ticks_to_slider_case_study()
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
  //panoData[1] = [coordsX, coordsY, frameID, tex, minX, maxX, minY, maxY, imageCount]
  let panoData = frame_to_tex()
  
  //redo objs
                                                //anchorX, anchorY, scaleFactor, pano_width, pano_height, new_transf_list
  let object_arr = filter_objs_by_frame_and_warp(panoData[0][4], panoData[0][5], panoData[0][3], panoData[0][1], panoData[0][2], panoData[0][6])
  var object_vec4_arr_vec = object_arr.map(function(el) {return new THREE.Vector4(el.x, el.y, el.object_label, el.frame_index)})
  let obj_array_length = object_vec4_arr_vec.length
  var object_vec4_arr_padded = object_vec4_arr_vec.concat(Array(700-object_vec4_arr_vec.length).fill(new THREE.Vector4( 1000, 1000, 1000, 1000 ))).sort((a, b) => parseFloat(a.z) - parseFloat(b.z));

  //redo arrows
  let arrows_arr = get_arrows(object_arr)
  let arrows_arr_vec = arrows_arr.map(function(el) {return new THREE.Vector4(el.x, el.y, el.z, el.w)})
  let arrows_array_length = arrows_arr_vec.length
  var arrows_arr_padded = arrows_arr_vec.concat(Array(700-arrows_arr.length).fill(new THREE.Vector4( 1000, 1000, 1000, 1000 )));

  //render
  renderer = [];
  camera = [];
  scene = [];
  material = [];
  target = [];
  fsScene = [];
  fsCamera = [];
  fsMaterial = [];

  // call initialize function only after loading image data
  //initData = [target, fsScene, fsCamera, fsMaterial, material, scene, camera, renderer]
  //var initData = init(panoData[1][5], panoData[1][4], panoData[1][7], panoData[1][6], panoData[1][8], panoData[1][0], panoData[1][1], panoData[1][3], renderer, camera, scene, material, controls, target, fsScene, fsCamera, fsMaterial, object_vec4_arr_padded, arrows_arr_padded);
  //init inputs: maxX, minX, maxY, minY, imageCount, coordsX, coordsY, tex, object_vec4_arr_padded, arrows_arr_padded
  init(panoData[1][5], panoData[1][4], panoData[1][7], panoData[1][6], panoData[1][8], panoData[1][0], panoData[1][1], panoData[1][3], object_vec4_arr_padded, arrows_arr_padded, obj_array_length, arrows_array_length);
  
  //animate(initData[0], initData[1], initData[2], initData[3], initData[4], initData[5], initData[6], initData[7], obj_data[1], object_arr, arrows_arr);
  animate(object_arr, arrows_arr, panoData[1][8]);
  
}