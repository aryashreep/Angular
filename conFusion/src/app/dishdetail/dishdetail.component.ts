import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  @ViewChild('cform') commentFormDirective;
  comment: Comment;
  commentForm: FormGroup;

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private commentformbuilder: FormBuilder,
    @Inject('BaseURL') private BaseURL) {
    this.createCommentForm();
  }

  ngOnInit() {
    this.dishService.getDishIds()
      .subscribe((dishIds) => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
  }

  setPrevNext(dishIds: string) {
    const index = this.dishIds.indexOf(dishIds);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  //Comment submission form
  commentFormErrors = {
    'author': '',
    'rating': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required': 'Author Name is required.',
      'minlength': 'Author Name must be at least 2 characters long'
    },
    'rating': {
      'required': 'Rating is required'
    },
    'comment': {
      'required': 'Comment is required.',
      'minlength': 'Comment must be at least 1 characters long'
    }
  };

  createCommentForm() {
    this.commentForm = this.commentformbuilder.group({
      author: ['', [Validators.required, Validators.minLength(2)]],
      rating: 5,
      comment: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); //for reset/set form validation msgs
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) {
      return;
    }
    const form = this.commentForm;

    for (const field in this.commentFormErrors) {
      this.commentFormErrors[field] = '';//clear the previous errors if any
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.commentFormErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  onCommentSubmit() {
    this.comment = this.commentForm.value;
    //date in ISO String format added
    this.comment.date = new Date().toISOString();
    //add the comment to comment list before resetting the form
    this.dish.comments.push(this.comment);

    this.commentForm.reset({
      author: '',
      rating: 5,
      comment: ''
    });
  }
}
